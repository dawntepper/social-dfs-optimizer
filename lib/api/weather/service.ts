import { weatherClient } from './client';
import { supabase } from '@/lib/supabase/client';
import { WeatherData } from '@/lib/types/projections';

export class WeatherService {
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  async getGameWeather(gameId: string, homeTeam: string): Promise<WeatherData> {
    try {
      // Check cache first
      const { data: cachedWeather } = await supabase
        .from('weather_data')
        .select('*')
        .eq('game_id', gameId)
        .single();

      const cacheExpired = !cachedWeather || 
        (Date.now() - new Date(cachedWeather.created_at).getTime() > this.CACHE_DURATION);

      if (!cacheExpired && cachedWeather) {
        return {
          temperature: cachedWeather.temperature,
          windSpeed: cachedWeather.wind_speed,
          precipitation: cachedWeather.precipitation,
          isIndoors: cachedWeather.is_dome
        };
      }

      // Get fresh weather data
      const weatherData = await weatherClient.getGameWeather(homeTeam);

      // Cache the results
      await supabase
        .from('weather_data')
        .upsert({
          game_id: gameId,
          temperature: weatherData.temperature,
          wind_speed: weatherData.windSpeed,
          precipitation: weatherData.precipitation,
          is_dome: weatherData.isIndoors,
          created_at: new Date().toISOString()
        });

      return weatherData;
    } catch (error) {
      console.error('Weather service error:', error);
      throw error;
    }
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
}

export const weatherService = new WeatherService();