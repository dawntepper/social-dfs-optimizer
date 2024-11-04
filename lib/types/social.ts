export interface SentimentResult {
  score: number;        // Normalized score (-1 to 1)
  comparative: number;  // Score per token
  tokens: string[];     // Words analyzed
  words: {
    positive: string[];
    negative: string[];
  };
  confidence: number;   // Confidence in analysis (0 to 1)
}

export interface SentimentDistribution {
  positive: number;  // Percentage of positive sentiment
  neutral: number;   // Percentage of neutral sentiment
  negative: number;  // Percentage of negative sentiment
}

export interface AggregatedSentiment {
  score: number;              // Weighted average score
  confidence: number;         // Overall confidence
  count: number;             // Number of texts analyzed
  distribution: SentimentDistribution;
}

export interface SocialMetrics {
  sentiment: number;         // Overall sentiment (-1 to 1)
  confidence: number;        // Confidence in the analysis (0 to 1)
  projectionAdjustment: number; // Percentage to adjust projection
  riskFactors: RiskFactor[];
  insights: string[];
  sources: {
    twitter?: any[];
    reddit?: any[];
  };
}

export interface RiskFactor {
  type: string;
  impact: number;
  description: string;
  confidence?: number;
}

export interface ContextualFactor {
  type: 'INJURY_RECOVERY' | 'ILLNESS' | 'PRACTICE_LIMITED' | 'WEATHER' | 'PERSONAL';
  severity?: number; // 0-1
  description?: string;
  source?: string;
}

export interface AIAnalysis {
  sentiment: number;
  confidence: number;
  projectionAdjustment: number;
  riskFactors: RiskFactor[];
  insights: string[];
}

export interface RedditData {
  mentions: any[];
  sentiment: number;
  beatWriterPosts: any[];
  discussions: any[];
  sources: {
    posts: any[];
    comments: any[];
  };
}