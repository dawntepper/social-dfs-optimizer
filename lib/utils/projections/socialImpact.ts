import { SocialMetrics } from '@/lib/types/projections';

export function calculateSocialImpact(metrics: SocialMetrics): number {
  let modifier = 1;
  
  // Sentiment analysis impact
  modifier += metrics.sentimentScore * 0.05; // Max ±5% impact

  // Beat writer sentiment (trusted sources)
  modifier += metrics.beatWriterSentiment * 0.07; // Max ±7% impact

  // Recent news impact
  modifier += metrics.recentNewsImpact * 0.06; // Max ±6% impact

  // Trending score (viral/hype factor)
  if (metrics.trendingScore > 0.8) {
    modifier += 0.03; // Bonus for highly trending players
  }

  // Volume of mentions
  const mentionImpact = Math.log10(metrics.mentionCount) * 0.01;
  modifier += Math.min(mentionImpact, 0.04); // Cap at 4%

  return modifier;
}