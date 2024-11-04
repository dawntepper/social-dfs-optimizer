import { twitterClient } from './twitter/client';
import { redditClient } from './reddit/client';
import { supabase } from '@/lib/supabase/client';
import { SentimentAnalyzer } from '@/lib/utils/sentiment';
import { Player } from '@/lib/types/dfs';

export class SocialService {
  private sentimentAnalyzer: SentimentAnalyzer;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.sentimentAnalyzer = new SentimentAnalyzer();
  }

  async getPlayerSentiment(player: Player) {
    try {
      // Check cache first
      const { data: cachedSentiment } = await supabase
        .from('social_sentiment')
        .select('*')
        .eq('player_id', player.id)
        .single();

      const cacheExpired = !cachedSentiment || 
        (Date.now() - new Date(cachedSentiment.created_at).getTime() > this.CACHE_DURATION);

      if (!cacheExpired && cachedSentiment) {
        return {
          sentiment: cachedSentiment.sentiment_score,
          beatWriterSentiment: cachedSentiment.beat_writer_sentiment,
          trendingScore: cachedSentiment.trending_score,
          mentionCount: cachedSentiment.mention_count
        };
      }

      // Get fresh social data
      const [tweets, beatWriterTweets, redditPosts] = await Promise.all([
        twitterClient.getPlayerTweets(player.name),
        twitterClient.getBeatWriterTweets(player.name, this.getBeatWriters(player.team)),
        redditClient.getPlayerPosts(player.name)
      ]);

      // Analyze sentiment
      const twitterSentiment = this.sentimentAnalyzer.analyzeMultiple(
        tweets.map(t => t.text)
      );

      const beatWriterSentiment = this.sentimentAnalyzer.analyzeMultiple(
        beatWriterTweets.map(t => t.text)
      );

      const redditSentiment = this.sentimentAnalyzer.analyzeMultiple(
        redditPosts.map(p => p.title + ' ' + p.text)
      );

      // Calculate weighted sentiment
      const sentiment = {
        score: this.calculateWeightedSentiment({
          twitter: twitterSentiment.score,
          beatWriter: beatWriterSentiment.score,
          reddit: redditSentiment.score
        }),
        beatWriterScore: beatWriterSentiment.score,
        trendingScore: this.calculateTrendingScore(tweets, redditPosts),
        mentionCount: tweets.length + redditPosts.length
      };

      // Cache the results
      await supabase
        .from('social_sentiment')
        .upsert({
          player_id: player.id,
          sentiment_score: sentiment.score,
          beat_writer_sentiment: sentiment.beatWriterScore,
          trending_score: sentiment.trendingScore,
          mention_count: sentiment.mentionCount,
          created_at: new Date().toISOString()
        });

      return sentiment;
    } catch (error) {
      console.error('Social service error:', error);
      throw error;
    }
  }

  private calculateWeightedSentiment(scores: {
    twitter: number;
    beatWriter: number;
    reddit: number;
  }): number {
    return (
      scores.twitter * 0.3 +
      scores.beatWriter * 0.5 +
      scores.reddit * 0.2
    );
  }

  private calculateTrendingScore(tweets: any[], posts: any[]): number {
    const totalEngagement = tweets.reduce((sum, t) => 
      sum + t.metrics.retweet_count + t.metrics.like_count, 0
    ) + posts.reduce((sum, p) => 
      sum + p.score + p.numComments, 0
    );

    // Normalize to 0-1 range
    return Math.min(totalEngagement / 1000, 1);
  }

  private getBeatWriters(team: string): string[] {
    // Map of team beat writers
    const beatWriters = {
      'KC': ['@AdamTeicher', '@HerbieTeope'],
      'BUF': ['@MatthewBove', '@SalSports'],
      // Add more teams and their beat writers
    };

    return beatWriters[team] || [];
  }
}

export const socialService = new SocialService();