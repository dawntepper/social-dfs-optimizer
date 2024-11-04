import { WeatherClient } from './WeatherClient';
import { cacheService } from '../cache/CacheService';
import { WeatherData } from '@/lib/types/projections';

export class WeatherService {
  private client: WeatherClient;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.client = new WeatherClient();
  }

  async getGameWeather(homeTeam: string, awayTeam: string): Promise<WeatherData> {
    try {
      const cacheKey = cacheService.generateKey('weather', { homeTeam, awayTeam });
      
      // Try to get from cache
      const cached = await cacheService.get<WeatherData>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get fresh data or mock if API key not available
      const weather = process.env.WEATHER_API_KEY 
        ? await this.client.getGameWeather(homeTeam)
        : this.getMockWeather(homeTeam);

      // Cache the result
      await cacheService.set(cacheKey, weather, this.CACHE_TTL);

      return weather;
    } catch (error) {
      console.error('Weather service error:', error);
      return this.getMockWeather(homeTeam);
    }
  }

  private getMockWeather(homeTeam: string): WeatherData {
    const indoorTeams = ['MIN', 'DET', 'NO', 'LV', 'DAL', 'HOU', 'IND', 'ATL', 'ARI', 'LA'];
    const isIndoor = indoorTeams.includes(homeTeam);

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

  getWeatherImpact(weather: WeatherData, position: string): number {
    if (weather.isIndoors) return 1.02; // Slight boost for indoor games

    let impact = 1;

    // Wind impacts passing game
    if (weather.windSpeed > 15 && ['QB', 'WR', 'TE'].includes(position)) {
      impact *= 0.95;
    }
    if (weather.windSpeed > 20) {
      impact *= 0.92;
    }

    // Precipitation impacts all positions
    if (weather.precipitation > 0) {
      impact *= 0.95;
    }

    // Temperature impacts
    if (weather.temperature < 32) {
      impact *= 0.97;
    }

    return impact;
  }

  getWeatherInsights(position: string, weather: WeatherData): string[] {
    const insights: string[] = [];

    if (weather.isIndoors) {
      insights.push('Indoor stadium provides optimal conditions');
      return insights;
    }

    if (weather.windSpeed > 20) {
      insights.push(`High winds (${weather.windSpeed} mph) may significantly impact passing game`);
    } else if (weather.windSpeed > 15) {
      insights.push(`Moderate winds (${weather.windSpeed} mph) could affect deep passes`);
    }

    if (weather.temperature < 32) {
      insights.push(`Cold temperature (${weather.temperature}°F) could affect performance`);
    }

    if (weather.precipitation > 0) {
      insights.push(`Precipitation chance (${weather.precipitation}%) may impact ball security`);
    }

    return insights;
  }
}

export const weatherService = new WeatherService();