import { db } from '@/lib/db';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
    // Clean expired cache entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.cache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.data;
    }

    // Remove expired memory cache entry
    if (memoryEntry) {
      this.cache.delete(key);
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { data: value, expiresAt });
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  generateKey(service: string, params: Record<string, any>): string {
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    
    return `${service}:${sortedParams}`;
  }
}

export const cacheService = CacheService.getInstance();