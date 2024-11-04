import { Player } from '@/lib/types/dfs';
import { SocialMetrics } from '@/lib/types/social';
import { TwitterService } from './TwitterService';
import { RedditService } from './RedditService';
import { db } from '@/lib/db';
import { socialSentiments } from '@/lib/db/schema';
import { sentiment } from '@/lib/utils/sentiment';

export class SocialService {
  private twitterService: TwitterService;
  private redditService: RedditService;

  constructor() {
    this.twitterService = new TwitterService();
    this.redditService = new RedditService();
  }

  async enhanceProjection(player: Player): Promise<number> {
    // Get social metrics from multiple sources
    const [twitterMetrics, redditMetrics] = await Promise.all([
      this.twitterService.getPlayerSentiment(player),
      this.redditService.getPlayerData(player)
    ]);
    
    // Calculate weighted sentiment
    const twitterWeight = 0.6;
    const redditWeight = 0.4;
    
    const weightedSentiment = 
      (twitterMetrics.sentiment * twitterWeight) +
      (redditMetrics.sentiment * redditWeight);

    // Calculate beat writer sentiment (weighted higher)
    const beatWriterSentiment = 
      (twitterMetrics.beatWriterSentiment || 0) * 0.7 +
      (redditMetrics.beatWriterSentiment || 0) * 0.3;

    // Calculate trending score
    const trendingScore = Math.max(
      twitterMetrics.trendingScore || 0,
      redditMetrics.trendingScore || 0
    );

    // Store metrics
    await db.insert(socialSentiments).values({
      playerId: player.id,
      timestamp: Date.now(),
      source: 'aggregated',
      sentiment: weightedSentiment,
      confidence: (twitterMetrics.confidence + redditMetrics.confidence) / 2,
      mentionCount: (twitterMetrics.mentionCount || 0) + (redditMetrics.mentionCount || 0),
      beatWriterSentiment,
      trendingScore
    });

    // Calculate projection modifier
    let modifier = 1;
    
    // General sentiment impact (-5% to +5%)
    modifier += weightedSentiment * 0.05;
    
    // Beat writer sentiment has more weight (-10% to +10%)
    modifier += beatWriterSentiment * 0.1;
    
    // Trending bonus (up to +3%)
    if (trendingScore > 0.8) {
      modifier += 0.03;
    }

    return modifier;
  }
}