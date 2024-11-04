import { TwitterService } from './TwitterService';
import { RedditService } from './RedditService';
import { AIAnalyzer } from '../ai/AIAnalyzer';
import { SentimentAnalyzer } from '@/lib/utils/sentiment';
import { db } from '@/lib/db';
import { socialSentiments } from '@/lib/db/schema';
import { Player } from '@/lib/types/dfs';

export class SocialAggregator {
  private twitterService: TwitterService;
  private redditService: RedditService;
  private aiAnalyzer: AIAnalyzer;
  private sentimentAnalyzer: SentimentAnalyzer;

  constructor() {
    this.twitterService = new TwitterService();
    this.redditService = new RedditService();
    this.aiAnalyzer = new AIAnalyzer();
    this.sentimentAnalyzer = new SentimentAnalyzer();
  }

  async getAggregatedSentiment(player: Player) {
    // Get social data from multiple sources
    const [twitterData, redditData] = await Promise.all([
      this.twitterService.getPlayerSentiment(player),
      this.redditService.getPlayerData(player)
    ]);

    // Calculate weighted sentiment
    const twitterWeight = 0.6;
    const redditWeight = 0.4;

    const sentiment = 
      (twitterData.sentiment * twitterWeight) +
      (redditData.sentiment * redditWeight);

    // Calculate confidence score
    const confidence = 
      (twitterData.confidence * twitterWeight) +
      (redditData.confidence * redditWeight);

    // Store sentiment data
    await db.insert(socialSentiments).values({
      playerId: player.id,
      timestamp: Date.now(),
      sentiment,
      confidence,
      mentionCount: twitterData.mentions.length,
      source: 'aggregated'
    });

    return {
      sentiment,
      confidence,
      projectionAdjustment: this.calculateProjectionAdjustment(sentiment, confidence),
      insights: this.generateInsights(player, twitterData, redditData)
    };
  }

  private calculateProjectionAdjustment(sentiment: number, confidence: number): number {
    // Convert sentiment (-1 to 1) to projection adjustment (-5% to +5%)
    const maxAdjustment = 0.05;
    return sentiment * confidence * maxAdjustment;
  }

  private generateInsights(player: Player, twitterData: any, redditData: any): string[] {
    const insights = [];

    if (Math.abs(twitterData.sentiment) > 0.7) {
      insights.push(
        `Strong ${twitterData.sentiment > 0 ? 'positive' : 'negative'} sentiment on Twitter`
      );
    }

    if (twitterData.mentions.length > 100) {
      insights.push('High social media engagement');
    }

    if (redditData.beatWriterPosts.length > 0) {
      insights.push('Recent beat writer updates available');
    }

    return insights;
  }
}