import OpenAI from 'openai';
import { RateLimiter } from '@/lib/utils/RateLimiter';
import { supabase } from '@/lib/supabase/client';

export class AIClient {
  private client: OpenAI;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Limit to 100 requests per minute
    this.rateLimiter = new RateLimiter(100, 60000);
  }

  async analyzePlayer(context: any) {
    await this.rateLimiter.waitForToken();

    try {
      const prompt = this.buildPlayerAnalysisPrompt(context);
      
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert NFL DFS analyst with deep knowledge of player performance, game theory, and statistical analysis. 
                     Provide concise, data-driven insights focusing on key factors that affect player performance and fantasy scoring.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        analysis: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  async analyzeCorrelations(context: any) {
    await this.rateLimiter.waitForToken();

    try {
      const prompt = this.buildCorrelationAnalysisPrompt(context);
      
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert in NFL DFS game theory and correlation analysis. 
                     Provide strategic insights on stacking opportunities and game script scenarios.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        analysis: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  private buildPlayerAnalysisPrompt(context: any): string {
    const {
      player,
      socialSentiment,
      weatherData,
      vegasData,
      recentPerformance,
      teamContext
    } = context;

    return `Analyze ${player.name}'s (${player.position}, ${player.team}) fantasy outlook considering:

1. Recent Performance: ${JSON.stringify(recentPerformance)}
2. Weather Impact: ${JSON.stringify(weatherData)}
3. Vegas Data: ${JSON.stringify(vegasData)}
4. Social Sentiment: ${JSON.stringify(socialSentiment)}
5. Team Context: ${JSON.stringify(teamContext)}

Focus on:
- Key performance factors
- Risk assessment
- Upside scenarios
- Optimal usage in different contest types`;
  }

  private buildCorrelationAnalysisPrompt(context: any): string {
    const {
      game,
      players,
      weatherData,
      vegasData,
      historicalCorrelations
    } = context;

    return `Analyze stacking opportunities for ${game.teams.join(' vs ')} considering:

1. Game Environment: ${JSON.stringify({ weather: weatherData, vegas: vegasData })}
2. Available Players: ${JSON.stringify(players)}
3. Historical Correlations: ${JSON.stringify(historicalCorrelations)}

Focus on:
- Optimal stack combinations
- Leverage opportunities
- Game script scenarios
- Contrarian approaches`;
  }
}

export const aiClient = new AIClient();