import sentiment from 'sentiment';

export class SentimentAnalyzer {
  private analyzer: any;
  private readonly SPORTS_LEXICON = {
    // Positive sports terms
    'breakout': 2,
    'explosive': 2,
    'dominant': 2,
    'healthy': 2,
    'starter': 1,
    'cleared': 1,
    'practiced': 1,
    
    // Negative sports terms
    'questionable': -1,
    'limited': -1,
    'doubtful': -2,
    'injured': -2,
    'out': -2,
    'bench': -1,
    'backup': -1,
    
    // Context modifiers
    'could': 0.5,
    'might': 0.5,
    'maybe': 0.5,
    'expected': 0.8,
    'likely': 0.8
  };

  constructor() {
    this.analyzer = new sentiment();
    // Register custom sports lexicon
    this.analyzer.registerLanguage('en', {
      labels: this.SPORTS_LEXICON
    });
  }

  analyze(text: string) {
    const result = this.analyzer.analyze(text);
    
    return {
      score: this.normalizeScore(result.score),
      comparative: result.comparative,
      tokens: result.tokens,
      words: {
        positive: result.positive,
        negative: result.negative
      },
      confidence: this.calculateConfidence(result)
    };
  }

  analyzeMultiple(texts: string[]) {
    const results = texts.map(text => this.analyze(text));
    
    // Weight more recent texts higher
    const weightedScores = results.map((result, index) => ({
      score: result.score,
      weight: Math.exp(-index * 0.1) // Exponential decay
    }));

    const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
    const weightedAverage = weightedScores.reduce(
      (sum, item) => sum + item.score * item.weight, 
      0
    ) / totalWeight;

    return {
      score: weightedAverage,
      confidence: this.aggregateConfidence(results),
      count: texts.length
    };
  }

  private normalizeScore(score: number): number {
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score / 5));
  }

  private calculateConfidence(result: any): number {
    // Base confidence on number of meaningful tokens
    const meaningfulTokens = result.positive.length + result.negative.length;
    const totalTokens = result.tokens.length;
    
    if (totalTokens === 0) return 0;

    // More meaningful tokens = higher confidence
    const tokenRatio = meaningfulTokens / totalTokens;
    
    // Stronger sentiment = higher confidence
    const sentimentStrength = Math.abs(result.comparative);
    
    return Math.min(1, (tokenRatio * 0.5 + sentimentStrength * 0.5));
  }

  private aggregateConfidence(results: any[]): number {
    // Higher confidence with more consistent results
    const scores = results.map(r => r.score);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    // Lower variance = higher confidence
    const consistencyFactor = Math.exp(-variance * 2);
    
    // More results = higher confidence (up to a point)
    const countFactor = Math.min(1, results.length / 10);
    
    return Math.min(1, consistencyFactor * 0.7 + countFactor * 0.3);
  }
}