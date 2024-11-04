import { RateLimiter } from '@/lib/utils/RateLimiter';

export class WeatherClient {
  private readonly API_KEY = process.env.WEATHER_API_KEY!;
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private rateLimiter: RateLimiter;

  // Stadium coordinates for weather lookup
  private readonly STADIUM_COORDS = {
    'KC': { lat: 39.0489, lon: -94.4839 },  // Arrowhead Stadium
    'BUF': { lat: 42.7738, lon: -78.7870 }, // Highmark Stadium
    'MIA': { lat: 25.9580, lon: -80.2389 }, // Hard Rock Stadium
    'SF': { lat: 37.7139, lon: -122.3861 }, // Levi's Stadium
    'LAC': { lat: 33.8644, lon: -118.2611 }, // SoFi Stadium
    'DEN': { lat: 39.7439, lon: -105.0201 }, // Mile High Stadium
    'LV': { lat: 36.0909, lon: -115.1833 }, // Allegiant Stadium
    'ARI': { lat: 33.5276, lon: -112.2626 }, // State Farm Stadium
  };

  // Indoor stadiums don't need weather checks
  private readonly INDOOR_STADIUMS = new Set([
    'MIN', 'DET', 'NO', 'LV', 'DAL', 'HOU',
    'IND', 'ATL', 'ARI', 'LA'
  ]);

  constructor() {
    // Limit to 60 requests per minute
    this.rateLimiter = new RateLimiter(60, 60000);
  }

  async getGameWeather(homeTeam: string) {
    // Return default indoor conditions for domed stadiums
    if (this.INDOOR_STADIUMS.has(homeTeam)) {
      return {
        temperature: 72, // Fahrenheit
        windSpeed: 0,
        precipitation: 0,
        isIndoors: true
      };
    }

    await this.rateLimiter.waitForToken();

    const coords = this.STADIUM_COORDS[homeTeam];
    if (!coords) {
      throw new Error(`Stadium coordinates not found for team: ${homeTeam}`);
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.API_KEY}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather API Error: ${response.status}`);
      }

      const data = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        windSpeed: Math.round(data.wind.speed),
        precipitation: this.calculatePrecipitation(data),
        isIndoors: false
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  }

  async getHistoricalWeather(homeTeam: string, date: Date) {
    if (this.INDOOR_STADIUMS.has(homeTeam)) {
      return {
        temperature: 72,
        windSpeed: 0,
        precipitation: 0,
        isIndoors: true
      };
    }

    await this.rateLimiter.waitForToken();

    const coords = this.STADIUM_COORDS[homeTeam];
    if (!coords) {
      throw new Error(`Stadium coordinates not found for team: ${homeTeam}`);
    }

    try {
      const timestamp = Math.floor(date.getTime() / 1000);
      const response = await fetch(
        `${this.BASE_URL}/onecall/timemachine?lat=${coords.lat}&lon=${coords.lon}&dt=${timestamp}&appid=${this.API_KEY}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather API Error: ${response.status}`);
      }

      const data = await response.json();
      const historicalData = data.current || data.hourly?.[0];

      return {
        temperature: Math.round(historicalData.temp),
        windSpeed: Math.round(historicalData.wind_speed),
        precipitation: this.calculatePrecipitation(historicalData),
        isIndoors: false
      };
    } catch (error) {
      console.error('Historical Weather API Error:', error);
      throw error;
    }
  }

  private calculatePrecipitation(weatherData: any): number {
    // Convert precipitation to inches if available
    const rain = weatherData.rain?.['1h'] || 0;
    const snow = weatherData.snow?.['1h'] || 0;
    return Number((rain + snow).toFixed(2));
  }
}

export const weatherClient = new WeatherClient();