import { Player } from '@/lib/types/dfs';
import { CorrelationStrategy } from './CorrelationStrategy';
import { AIStrategy } from './AIStrategy';

export class StackStrategy {
  private correlationStrategy: CorrelationStrategy;
  private aiStrategy: AIStrategy;

  constructor() {
    this.correlationStrategy = new CorrelationStrategy();
    this.aiStrategy = new AIStrategy();
  }

  async analyzeStack(players: Player[]): Promise<{
    correlation: number;
    confidence: number;
    insights: string[];
    projectionAdjustment: number;
  }> {
    const [correlation, aiAnalysis] = await Promise.all([
      this.correlationStrategy.getStackCorrelation(players),
      this.aiStrategy.analyzeStack(players)
    ]);

    return {
      correlation,
      confidence: aiAnalysis.confidence,
      insights: aiAnalysis.insights,
      projectionAdjustment: aiAnalysis.projectionAdjustment
    };
  }

  getStackTypes(players: Player[]): string[] {
    const positions = players.map(p => p.position);
    const qb = positions.includes('QB');
    const wr = positions.filter(p => p === 'WR').length;
    const te = positions.includes('TE');
    const rb = positions.includes('RB');

    const types: string[] = [];

    if (qb) {
      if (wr >= 2) types.push('QB Double Stack');
      if (wr === 1 && te) types.push('QB-WR-TE Stack');
      if (wr === 1 && rb) types.push('QB-WR-RB Stack');
    }

    if (rb && positions.includes('DST')) {
      types.push('Game Script Stack');
    }

    return types;
  }

  getStackSynergy(players: Player[]): number {
    const positions = players.map(p => p.position);
    let synergy = 1;

    // QB stacks
    if (positions.includes('QB')) {
      const wrCount = positions.filter(p => p === 'WR').length;
      if (wrCount >= 2) synergy *= 1.2; // Double stack bonus
      if (positions.includes('TE')) synergy *= 1.1; // TE correlation
      if (positions.includes('RB')) synergy *= 1.05; // RB dump-offs
    }

    // Game script stacks
    if (positions.includes('RB') && positions.includes('DST')) {
      synergy *= 1.15; // Positive game script correlation
    }

    return synergy;
  }
}