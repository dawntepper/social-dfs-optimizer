import { db } from '@/lib/db';
import { ai_analysis_cache } from '@/lib/db/schema';

export class AICacheManager {
  private readonly DEFAULT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  async getCachedAnalysis(cacheKey: string): Promise<any | null> {
    try {
      const { data } = await db.select()
        .from(ai_analysis_cache)
        .where(sql`cache_key = ${cacheKey}`)
        .where(sql`expires_at > ${new Date().toISOString()}`)
        .limit(1);

      return data?.[0]?.analysis || null;
    } catch (error) {
      console.error('Error retrieving cached analysis:', error);
      return null;
    }
  }

  async cacheAnalysis(
    cacheKey: string,
    analysisType: string,
    analysis: any,
    contextData: any,
    duration: number = this.DEFAULT_CACHE_DURATION
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + duration);

      await db.insert(ai_analysis_cache).values({
        cache_key: cacheKey,
        analysis_type: analysisType,
        analysis,
        context_data: contextData,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        confidence: this.calculateConfidence(analysis)
      });
    } catch (error) {
      console.error('Error caching analysis:', error);
    }
  }

  async invalidateCache(cacheKey: string): Promise<void> {
    try {
      await db.delete(ai_analysis_cache)
        .where(sql`cache_key = ${cacheKey}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  async cleanExpiredCache(): Promise<void> {
    try {
      await db.delete(ai_analysis_cache)
        .where(sql`expires_at < ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
    }
  }

  generateCacheKey(type: string, contextData: any): string {
    const contextHash = JSON.stringify(contextData);
    return `${type}_${contextHash}`;
  }

  private calculateConfidence(analysis: any): number {
    // Base confidence score
    let confidence = 0.7;

    // Adjust based on analysis completeness
    if (!analysis) return 0;

    // Increase confidence for comprehensive analysis
    if (analysis.insights?.length > 0) confidence += 0.1;
    if (analysis.recommendations?.length > 0) confidence += 0.1;

    // Cap confidence at 0.95
    return Math.min(0.95, confidence);
  }
}

export const aiCacheManager = new AICacheManager();