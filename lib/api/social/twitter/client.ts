import { TwitterApi } from 'twitter-api-v2';
import { RateLimiter } from '@/lib/utils/RateLimiter';

export class TwitterClient {
  private client: TwitterApi;
  private rateLimiter: RateLimiter;

  constructor() {
    if (!process.env.TWITTER_API_KEY) throw new Error('Missing TWITTER_API_KEY');
    if (!process.env.TWITTER_API_SECRET) throw new Error('Missing TWITTER_API_SECRET');
    if (!process.env.TWITTER_ACCESS_TOKEN) throw new Error('Missing TWITTER_ACCESS_TOKEN');
    if (!process.env.TWITTER_ACCESS_SECRET) throw new Error('Missing TWITTER_ACCESS_SECRET');

    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    this.rateLimiter = new RateLimiter(450, 900000); // 450 requests per 15 minutes
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.rateLimiter.waitForToken();
      
      // Test the connection by getting user context
      const user = await this.client.v2.me();
      
      if (user) {
        return {
          success: true,
          message: 'Successfully connected to Twitter API'
        };
      } else {
        throw new Error('No response from Twitter API');
      }
    } catch (error: any) {
      console.error('Twitter API Error:', error);
      throw new Error(`Twitter API connection failed: ${error.message}`);
    }
  }

  async getPlayerTweets(playerName: string, options = { limit: 25 }) {
    await this.rateLimiter.waitForToken();

    try {
      const tweets = await this.client.v2.search({
        query: playerName,
        max_results: options.limit,
        'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
        expansions: ['author_id'],
      });

      return tweets.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id,
        metrics: tweet.public_metrics,
        createdAt: tweet.created_at
      }));
    } catch (error) {
      console.error('Twitter API Error:', error);
      throw error;
    }
  }

  async getBeatWriterTweets(playerName: string, beatWriters: string[], options = { limit: 25 }) {
    await this.rateLimiter.waitForToken();

    try {
      const query = `${playerName} (${beatWriters.join(' OR ')})`;
      const tweets = await this.client.v2.search({
        query,
        max_results: options.limit,
        'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
        expansions: ['author_id'],
      });

      return tweets.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id,
        metrics: tweet.public_metrics,
        createdAt: tweet.created_at
      }));
    } catch (error) {
      console.error('Twitter API Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const twitterClient = new TwitterClient();