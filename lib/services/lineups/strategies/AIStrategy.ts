import { Player } from '@/lib/types/dfs';
import { AIService } from '../../ai/AIService';
import { SocialService } from '../../social/SocialService';

export class AIStrategy {
  private aiService: AIService;
  private socialService: SocialService;

  constructor() {
    this.aiService = new AIService();
    this.socialService = new SocialService();
  }

  async analyzeStack(players: Player[]): Promise<{
    confidence: number;
    insights: string[];
    projectionAdjustment: number;
  }> {
    const [aiAnalysis, socialMetrics] = await Promise.all([
      this.getAIAnalysis(players),
      this.getSocialAnalysis(players)
    ]);

    return {
      confidence: (aiAnalysis.confidence + socialMetrics.confidence) / 2,
      insights: [...aiAnalysis.insights, ...socialMetrics.insights],
      projectionAdjustment: (aiAnalysis.projectionAdjustment + socialMetrics.projectionAdjustment) / 2
    };
  }

  private async getAIAnalysis(players: Player[]) {
    const analysis = await this.aiService.analyzeStack({
      players,
      type: 'correlation',
      contextData: {
        team: players[0].team,
        opponent: players[0].opponent,
        positions: players.map(p => p.position)
      }
    });

    return {
      confidence: analysis.confidence,
      insights: analysis.insights,
      projectionAdjustment: analysis.projectionAdjustment
    };
  }

  private async getSocialAnalysis(players: Player[]) {
    const socialMetrics = await Promise.all(
      players.map(p => this.socialService.getPlayerSentiment(p))
    );

    const avgSentiment = socialMetrics.reduce((sum, m) => sum + m.sentiment, 0) / socialMetrics.length;
    const avgConfidence = socialMetrics.reduce((sum, m) => sum + m.confidence, 0) / socialMetrics.length;

    return {
      confidence: avgConfidence,
      insights: socialMetrics.flatMap(m => m.insights),
      projectionAdjustment: avgSentiment * 0.05 // 5% max adjustment based on sentiment
    };
  }
}