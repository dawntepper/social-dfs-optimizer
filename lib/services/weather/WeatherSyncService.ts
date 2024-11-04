import { WeatherService } from './WeatherService';
import { supabase } from '@/lib/supabase/client';
import { WeatherData } from '@/lib/types/projections';
import { slateService } from '../slates/SlateService';

export class WeatherSyncService {
  private weatherService: WeatherService;
  private readonly SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.weatherService = new WeatherService();
  }

  async startSync() {
    // Perform initial sync
    await this.syncData();

    // Set up interval for regular syncs
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, this.SYNC_INTERVAL);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncData() {
    try {
      // Log sync start
      await this.logSync('started');

      // Get all games from current slate
      const games = slateService.getGames();

      // Fetch and store weather data for each game
      await Promise.all(
        games.map(async (game) => {
          const weatherData = await this.weatherService.getGameWeather(
            game.homeTeam,
            game.awayTeam
          );
          await this.storeWeatherData(game.homeTeam, game.awayTeam, weatherData);
        })
      );

      // Log successful sync
      await this.logSync('completed');
    } catch (error) {
      console.error('Weather sync failed:', error);
      await this.logSync('failed', error.message);
      throw error;
    }
  }

  private async storeWeatherData(
    homeTeam: string,
    awayTeam: string,
    weather: WeatherData
  ) {
    const gameId = `${homeTeam}_${awayTeam}`;

    const { error } = await supabase
      .from('weather_data')
      .upsert({
        game_id: gameId,
        temperature: weather.temperature,
        wind_speed: weather.windSpeed,
        precipitation: weather.precipitation,
        is_dome: weather.isIndoors,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  private async logSync(status: 'started' | 'completed' | 'failed', errorMessage?: string) {
    const { error } = await supabase
      .from('sync_logs')
      .insert({
        service: 'weather',
        status,
        error_message: errorMessage,
        created_at: new Date().toISOString()
      });

    if (error) console.error('Failed to log sync:', error);
  }

  async getLastSyncStatus(): Promise<{
    lastSync: Date | null;
    status: string;
    error?: string;
  }> {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('service', 'weather')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Failed to get sync status:', error);
      return { lastSync: null, status: 'unknown' };
    }

    return {
      lastSync: data ? new Date(data.created_at) : null,
      status: data?.status || 'unknown',
      error: data?.error_message
    };
  }
}

// Export singleton instance
export const weatherSyncService = new WeatherSyncService();