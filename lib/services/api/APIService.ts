import { weatherClient } from './weather/WeatherClient';
import { vegasClient } from './vegas/VegasClient';
import { aiClient } from './ai/AIClient';
import { espnClient } from './espn/ESPNClient';
import { cacheService } from '../cache/CacheService';

export class APIService {
  private static instance: APIService;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  async getWeatherData(gameId: string, homeTeam: string) {
    const cacheKey = `weather_${gameId}`;
    try {
      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      // Try live API
      if (process.env.WEATHER_API_KEY) {
        const data = await weatherClient.getGameWeather(homeTeam);
        await cacheService.set(cacheKey, data, this.CACHE_DURATION);
        return data;
      }

      // Fallback to mock data
      return this.getMockWeatherData(homeTeam);
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeatherData(homeTeam);
    }
  }

  async getVegasOdds(gameId: string) {
    const cacheKey = `vegas_${gameId}`;
    try {
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      if (process.env.VEGAS_ODDS_API_KEY) {
        const data = await vegasClient.getGameOdds(gameId);
        await cacheService.set(cacheKey, data, this.CACHE_DURATION);
        return data;
      }

      return this.getMockVegasOdds(gameId);
    } catch (error) {
      console.error('Vegas API error:', error);
      return this.getMockVegasOdds(gameId);
    }
  }

  async getAIAnalysis(context: any) {
    try {
      if (process.env.OPENAI_API_KEY) {
        return await aiClient.generateAnalysis(context);
      }
      return this.getMockAIAnalysis(context);
    } catch (error) {
      console.error('AI API error:', error);
      return this.getMockAIAnalysis(context);
    }
  }

  async getESPNStats(playerId: string) {
    const cacheKey = `espn_${playerId}`;
    try {
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const data = await espnClient.getPlayerStats(playerId);
      await cacheService.set(cacheKey, data, this.CACHE_DURATION);
      return data;
    } catch (error) {
      console.error('ESPN API error:', error);
      return this.getMockESPNStats(playerId);
    }
  }

  private getMockWeatherData(homeTeam: string) {
    const isIndoor = ['MIN', 'DET', 'NO', 'LV', 'DAL', 'HOU', 'IND', 'ATL', 'ARI'].includes(homeTeam);
    
    if (isIndoor) {
      return {
        temperature: 72,
        windSpeed: 0,
        precipitation: 0,
        isIndoors: true
      };
    }

    return {
      temperature: 65 + Math.floor(Math.random() * 20),
      windSpeed: Math.floor(Math.random() * 15),
      precipitation: Math.random() * 0.5,
      isIndoors: false
    };
  }

  private getMockVegasOdds(gameId: string) {
    const [awayTeam, homeTeam] = gameId.split('_');
    const isHighScoring = ['KC', 'BUF', 'SF'].includes(homeTeam);
    
    return {
      total: isHighScoring ? 51.5 : 44.5,
      spread: -3,
      homeTeamTotal: isHighScoring ? 27.5 : 23.5,
      awayTeamTotal: isHighScoring ? 24 : 21,
      moneyline: {
        home: -150,
        away: +130
      }
    };
  }

  private getMockAIAnalysis(context: any) {
    return {
      sentiment: Math.random() * 2 - 1,
      confidence: 0.7 + Math.random() * 0.3,
      insights: [
        'Strong correlation with team performance',
        'Weather conditions are favorable',
        'Recent social sentiment trending positive'
      ],
      projectionAdjustment: (Math.random() * 0.2) - 0.1,
      riskFactors: [
        {
          type: 'WEATHER',
          impact: Math.random() * 0.1,
          description: 'Mild weather conditions expected'
        },
        {
          type: 'VEGAS',
          impact: Math.random() * 0.15,
          description: 'High implied team total'
        }
      ]
    };
  }

  private getMockESPNStats(playerId: string) {
    return {
      lastFiveGames: Array(5).fill(null).map(() => ({
        passingYards: Math.floor(Math.random() * 300) + 150,
        passingTDs: Math.floor(Math.random() * 3),
        rushingYards: Math.floor(Math.random() * 50),
        rushingTDs: Math.random() > 0.8 ? 1 : 0,
        receptions: Math.floor(Math.random() * 8),
        receivingYards: Math.floor(Math.random() * 100),
        receivingTDs: Math.random() > 0.8 ? 1 : 0
      })),
      seasonStats: {
        gamesPlayed: 15,
        totalPoints: Math.floor(Math.random() * 200) + 100,
        avgPoints: (Math.random() * 15) + 10
      }
    };
  }
}

export const apiService = APIService.getInstance();