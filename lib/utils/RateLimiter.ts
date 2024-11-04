export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillInterval: number;

  constructor(maxTokens: number, refillInterval: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.refillInterval = refillInterval;
  }

  private refillTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const refills = Math.floor(timePassed / this.refillInterval);

    if (refills > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + refills);
      this.lastRefill = now;
    }
  }

  async waitForToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }

    // Wait for next refill
    const waitTime = this.refillInterval - (Date.now() - this.lastRefill);
    return new Promise(resolve => setTimeout(resolve, waitTime));
  }
}