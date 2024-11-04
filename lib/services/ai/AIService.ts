import OpenAI from 'openai';
import { RateLimiter } from '@/lib/utils/RateLimiter';
import { aiCacheManager } from './AICacheManager';

interface AIAnalysisOptions {
  type: 'player' | 'game' | 'slate' | 'correlation' | 'lineups';
  contextData: any;
  forceRefresh?: boolean;
  cacheDuration?: number;
}

export class AIService {
  private client: OpenAI;
  private rateLimiter: RateLimiter;
  private static instance: AIService;

  private constructor() {
    // Initialize rate limiter first
    this.rateLimiter = new RateLimiter(50, 60000);

    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'OpenAI API key not found. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file.'
      );
    }

    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      try {
        AIService.instance = new AIService();
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
        throw error;
      }
    }
    return AIService.instance;
  }

  async analyzeLineups(lineups: any[]) {
    try {
      await this.rateLimiter.waitForToken();

      const prompt = this.buildLineupAnalysisPrompt(lineups);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are an expert NFL DFS analyst. Analyze the provided lineups and provide insights on:
              1. Stack correlations and effectiveness
              2. Ownership leverage points
              3. Game theory advantages
              4. Potential improvements
              5. Contest type suitability
              Keep the analysis concise but comprehensive.`
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const analysis = {
        score: this.calculateAnalysisScore(lineups),
        insights: this.extractInsights(completion.choices[0].message.content),
        recommendations: this.extractRecommendations(completion.choices[0].message.content),
        correlations: this.analyzeCorrelations(lineups),
        ownership: this.analyzeOwnership(lineups),
        exposure: this.analyzeExposure(lineups)
      };

      return analysis;
    } catch (error) {
      console.error('AI lineup analysis error:', error);
      
      // Provide a more user-friendly error message
      if (error.message?.includes('API key')) {
        throw new Error(
          'OpenAI API key is invalid or missing. Please check your environment configuration.'
        );
      }
      
      throw new Error('Failed to analyze lineups. Please try again later.');
    }
  }

  private buildLineupAnalysisPrompt(lineups: any[]): string {
    return `Analyze these ${lineups.length} NFL DFS lineups:

    ${JSON.stringify(lineups.map(lineup => ({
      players: lineup.players.map(p => ({
        name: p.name,
        position: p.position,
        team: p.team,
        ownership: p.ownership,
        salary: p.salary,
        projectedPoints: p.projectedPoints
      })),
      totalSalary: lineup.totalSalary,
      projectedPoints: lineup.projectedPoints,
      totalOwnership: lineup.totalOwnership
    })))}

    Provide analysis on:
    1. Stack effectiveness and correlation
    2. Ownership leverage
    3. Game theory advantages/disadvantages
    4. Potential improvements
    5. Best contest types for these lineups`;
  }

  private calculateAnalysisScore(lineups: any[]): number {
    let score = 85; // Base score
    
    // Analyze lineup diversity
    const uniqueness = this.calculateUniqueness(lineups);
    score += uniqueness * 5;

    // Analyze ownership
    const ownershipScore = this.calculateOwnershipScore(lineups);
    score += ownershipScore * 5;

    // Analyze correlations
    const correlationScore = this.calculateCorrelationScore(lineups);
    score += correlationScore * 5;

    return Math.min(100, Math.max(0, score));
  }

  private calculateUniqueness(lineups: any[]): number {
    const uniquePlayers = new Set();
    lineups.forEach(lineup => {
      lineup.players.forEach(player => uniquePlayers.add(player.id));
    });
    return uniquePlayers.size / (lineups.length * 9); // 9 players per lineup
  }

  private calculateOwnershipScore(lineups: any[]): number {
    const avgOwnership = lineups.reduce((sum, lineup) => 
      sum + lineup.totalOwnership, 0) / lineups.length;
    return Math.min(1, Math.max(0, 1 - (avgOwnership / 100)));
  }

  private calculateCorrelationScore(lineups: any[]): number {
    let totalCorrelation = 0;
    lineups.forEach(lineup => {
      const qb = lineup.players.find(p => p.position === 'QB');
      if (qb) {
        const receivers = lineup.players.filter(p => 
          ['WR', 'TE'].includes(p.position) && p.team === qb.team
        );
        totalCorrelation += receivers.length * 0.2;
      }
    });
    return Math.min(1, totalCorrelation / lineups.length);
  }

  private extractInsights(content: string): string[] {
    const insights = content.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.trim().replace(/^[-•]\s*/, ''));
    
    return insights.slice(0, 5);
  }

  private extractRecommendations(content: string): string[] {
    const recommendations = content.split('\n')
      .filter(line => line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest'))
      .map(line => line.trim());
    
    return recommendations.slice(0, 3);
  }

  private analyzeCorrelations(lineups: any[]) {
    const correlations = {
      strongCorrelations: [],
      weakCorrelations: [],
      missedOpportunities: []
    };

    lineups.forEach(lineup => {
      const qb = lineup.players.find(p => p.position === 'QB');
      if (qb) {
        const receivers = lineup.players.filter(p => 
          ['WR', 'TE'].includes(p.position) && p.team === qb.team
        );
        if (receivers.length >= 2) {
          correlations.strongCorrelations.push({
            type: 'QB Stack',
            players: [qb, ...receivers]
          });
        }
      }
    });

    return correlations;
  }

  private analyzeOwnership(lineups: any[]) {
    const ownershipData = {
      averageOwnership: 0,
      leverageSpots: [],
      highOwned: [],
      lowOwned: []
    };

    const playerOwnership = new Map();
    lineups.forEach(lineup => {
      lineup.players.forEach(player => {
        const current = playerOwnership.get(player.id) || { 
          ...player, 
          count: 0 
        };
        current.count++;
        playerOwnership.set(player.id, current);
      });
    });

    playerOwnership.forEach((data, id) => {
      const exposure = (data.count / lineups.length) * 100;
      if (exposure > data.ownership + 10) {
        ownershipData.highOwned.push({ ...data, exposure });
      } else if (exposure < data.ownership - 10) {
        ownershipData.lowOwned.push({ ...data, exposure });
      }
    });

    return ownershipData;
  }

  private analyzeExposure(lineups: any[]) {
    const exposureData = {
      overexposed: [],
      underexposed: [],
      recommendations: []
    };

    const playerExposure = new Map();
    lineups.forEach(lineup => {
      lineup.players.forEach(player => {
        const current = playerExposure.get(player.id) || { 
          ...player, 
          exposure: 0 
        };
        current.exposure++;
        playerExposure.set(player.id, current);
      });
    });

    playerExposure.forEach((data, id) => {
      const exposure = (data.exposure / lineups.length) * 100;
      if (exposure > 50) {
        exposureData.overexposed.push({ ...data, exposure });
      } else if (exposure < 10) {
        exposureData.underexposed.push({ ...data, exposure });
      }
    });

    return exposureData;
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();