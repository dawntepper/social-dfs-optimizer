import puppeteer, { Browser, Page } from 'puppeteer';
import { RateLimiter } from '@/lib/utils/RateLimiter';
import { db } from '@/lib/db';

export class SlateDownloader {
  private rateLimiter: RateLimiter;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cache: Map<string, { data: string, timestamp: number }>;
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds

  constructor() {
    // Separate rate limits for different sites
    this.rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
    this.cache = new Map();
  }

  private async setupBrowser(): Promise<Browser> {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });
  }

  private async setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    
    // Configure page settings
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Add request interception
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      // Block unnecessary resources
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Add error handling
    page.on('error', (err) => {
      console.error('Page error:', err);
    });

    return page;
  }

  async downloadDraftKingsSlate(contestId: string): Promise<string> {
    await this.rateLimiter.waitForToken();

    // Check cache first
    const cacheKey = `dk_${contestId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    let browser: Browser | null = null;
    let attempts = 0;

    while (attempts < this.RETRY_ATTEMPTS) {
      try {
        browser = await this.setupBrowser();
        const page = await this.setupPage(browser);

        // Add authentication if needed
        // await this.authenticateDraftKings(page);

        // Navigate to contest page with timeout
        await Promise.race([
          page.goto(`https://www.draftkings.com/lineup/download/${contestId}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Navigation timeout')), 30000)
          )
        ]);

        // Wait for and verify download button
        const downloadButton = await page.waitForSelector('.download-button', {
          timeout: 5000,
          visible: true
        });

        if (!downloadButton) {
          throw new Error('Download button not found');
        }

        // Get CSV content
        const csvContent = await page.evaluate(() => {
          const element = document.querySelector('pre');
          if (!element) throw new Error('CSV content not found');
          return element.textContent;
        });

        if (!csvContent) {
          throw new Error('Empty CSV content');
        }

        // Validate CSV format
        if (!this.validateCSVContent(csvContent)) {
          throw new Error('Invalid CSV format');
        }

        // Cache the result
        this.cache.set(cacheKey, {
          data: csvContent,
          timestamp: Date.now()
        });

        // Store in database
        await this.storeSlateData('draftkings', contestId, csvContent);

        return csvContent;

      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, error);
        
        if (attempts === this.RETRY_ATTEMPTS) {
          throw new Error(`Failed to download slate after ${this.RETRY_ATTEMPTS} attempts`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }

    throw new Error('Failed to download slate');
  }

  async downloadFanDuelSlate(contestId: string): Promise<string> {
    await this.rateLimiter.waitForToken();

    const cacheKey = `fd_${contestId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    let browser: Browser | null = null;
    let attempts = 0;

    while (attempts < this.RETRY_ATTEMPTS) {
      try {
        browser = await this.setupBrowser();
        const page = await this.setupPage(browser);

        // Add authentication if needed
        // await this.authenticateFanDuel(page);

        await Promise.race([
          page.goto(`https://www.fanduel.com/games/${contestId}/download`, {
            waitUntil: 'networkidle0',
            timeout: 30000
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Navigation timeout')), 30000)
          )
        ]);

        const csvContent = await page.evaluate(() => {
          const element = document.querySelector('pre');
          if (!element) throw new Error('CSV content not found');
          return element.textContent;
        });

        if (!csvContent) {
          throw new Error('Empty CSV content');
        }

        if (!this.validateCSVContent(csvContent)) {
          throw new Error('Invalid CSV format');
        }

        this.cache.set(cacheKey, {
          data: csvContent,
          timestamp: Date.now()
        });

        await this.storeSlateData('fanduel', contestId, csvContent);

        return csvContent;

      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, error);
        
        if (attempts === this.RETRY_ATTEMPTS) {
          throw new Error(`Failed to download slate after ${this.RETRY_ATTEMPTS} attempts`);
        }
        
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }

    throw new Error('Failed to download slate');
  }

  async getAvailableSlates(site: 'draftkings' | 'fanduel'): Promise<Array<{ id: string, name: string, startTime: string }>> {
    await this.rateLimiter.waitForToken();

    let browser: Browser | null = null;
    try {
      browser = await this.setupBrowser();
      const page = await this.setupPage(browser);

      if (site === 'draftkings') {
        await page.goto('https://www.draftkings.com/lobby#/NFL', {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        // Wait for contests to load
        await page.waitForSelector('.contest-card', { timeout: 10000 });

        return await page.evaluate(() => {
          const contestElements = document.querySelectorAll('.contest-card');
          return Array.from(contestElements).map(el => ({
            id: el.getAttribute('data-contest-id') || '',
            name: el.querySelector('.contest-name')?.textContent || '',
            startTime: el.querySelector('.start-time')?.textContent || ''
          })).filter(contest => contest.id && contest.name && contest.startTime);
        });
      } else {
        await page.goto('https://www.fanduel.com/games', {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        await page.waitForSelector('.contest-card', { timeout: 10000 });

        return await page.evaluate(() => {
          const contestElements = document.querySelectorAll('.contest-card');
          return Array.from(contestElements).map(el => ({
            id: el.getAttribute('data-contest-id') || '',
            name: el.querySelector('.contest-name')?.textContent || '',
            startTime: el.querySelector('.start-time')?.textContent || ''
          })).filter(contest => contest.id && contest.name && contest.startTime);
        });
      }
    } catch (error) {
      console.error(`Failed to get available ${site} slates:`, error);
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private validateCSVContent(content: string): boolean {
    // Check if content is empty
    if (!content.trim()) return false;

    // Split into lines
    const lines = content.trim().split('\n');
    if (lines.length < 2) return false; // Need at least header and one row

    // Check header
    const header = lines[0].toLowerCase();
    const requiredFields = ['name', 'position', 'salary', 'team'];
    return requiredFields.every(field => header.includes(field));
  }

  private async storeSlateData(site: string, contestId: string, data: string) {
    await db.query(`
      INSERT INTO slates (site, contest_id, data, created_at)
      VALUES (?, ?, ?, ?)
    `, [site, contestId, data, new Date().toISOString()]);
  }

  validateUploadedSlate(file: File, site: 'draftkings' | 'fanduel'): boolean {
    if (!file.name.endsWith('.csv')) {
      throw new Error('File must be a CSV');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size too large');
    }

    return true;
  }
}