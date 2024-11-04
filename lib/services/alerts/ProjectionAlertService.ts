import { Player } from '@/lib/types/dfs';
import { SocialMetrics } from '@/lib/types/social';
import { db } from '@/lib/db';
import { projectionAlerts } from '@/lib/db/schema';
import { TwitterService } from '../social/TwitterService';
import { RedditService } from '../social/RedditService';
import { AIAnalyzer } from '../ai/AIAnalyzer';

export class ProjectionAlertService {
  private readonly THRESHOLDS = {
    CRITICAL: 0.15,
    HIGH: 0.10,
    MEDIUM: 0.05,
    LOW: 0.03
  };

  private twitterService: TwitterService;
  private redditService: RedditService;
  private aiAnalyzer: AIAnalyzer;

  constructor() {
    this.twitterService = new TwitterService();
    this.redditService = new RedditService();
    this.aiAnalyzer = new AIAnalyzer();
  }

  async checkProjectionChange(
    player: Player,
    oldProjection: number,
    newProjection: number,
    socialMetrics: SocialMetrics
  ) {
    const percentageChange = Math.abs((newProjection - oldProjection) / oldProjection);
    
    if (percentageChange >= this.THRESHOLDS.LOW) {
      // Get relevant social posts that contributed to the change
      const [tweets, redditPosts] = await Promise.all([
        this.twitterService.getRelevantTweets(player, 5),
        this.redditService.getRelevantPosts(player, 5)
      ]);

      // Generate AI summary of the changes and social context
      const aiSummary = await this.aiAnalyzer.generateChangeSummary({
        player,
        oldProjection,
        newProjection,
        socialMetrics,
        tweets,
        redditPosts
      });

      const severity = this.getSeverityLevel(percentageChange);
      const alert = {
        playerId: player.id,
        playerName: player.name,
        timestamp: Date.now(),
        oldProjection,
        newProjection,
        percentageChange,
        severity,
        reason: this.getChangeReason(socialMetrics),
        confidence: socialMetrics.confidence,
        relatedPosts: [
          ...tweets.map(tweet => ({
            id: tweet.id,
            platform: 'twitter' as const,
            author: tweet.author,
            content: tweet.text,
            sentiment: tweet.sentiment,
            timestamp: tweet.timestamp,
            verified: tweet.verified,
            engagement: tweet.metrics.total
          })),
          ...redditPosts.map(post => ({
            id: post.id,
            platform: 'reddit' as const,
            author: post.author,
            content: post.text,
            sentiment: post.sentiment,
            timestamp: post.timestamp,
            verified: post.isVerified,
            engagement: post.score
          }))
        ],
        aiSummary
      };

      // Store alert in database
      await db.insert(projectionAlerts).values(alert);

      return alert;
    }

    return null;
  }

  private getSeverityLevel(change: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (change >= this.THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (change >= this.THRESHOLDS.HIGH) return 'HIGH';
    if (change >= this.THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  private getChangeReason(metrics: SocialMetrics): string {
    const reasons: string[] = [];

    if (Math.abs(metrics.sentiment) > 0.7) {
      reasons.push(`Strong ${metrics.sentiment > 0 ? 'positive' : 'negative'} social sentiment`);
    }

    if (metrics.riskFactors.length > 0) {
      reasons.push(...metrics.riskFactors.map(rf => rf.description));
    }

    return reasons.join('; ') || 'Multiple factors';
  }

  async getRecentAlerts(minutes: number = 30) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    
    // Using the in-memory database query interface
    return await db.query(projectionAlerts, (alert) => 
      alert.timestamp > cutoff
    ).sort((a, b) => b.timestamp - a.timestamp);
  }
}