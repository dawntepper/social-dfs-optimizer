import { Player } from '@/lib/types/dfs';
import { WeatherService } from '../../weather/WeatherService';
import { VegasService } from '../../vegas/VegasService';

export class CorrelationStrategy {
  private weatherService: WeatherService;
  private vegasService: VegasService;

  constructor() {
    this.weatherService = new WeatherService();
    this.vegasService = new VegasService();
  }

  async getStackCorrelation(players: Player[]): Promise<number> {
    const baseCorrelation = this.getBaseCorrelation(players);
    const [weatherImpact, vegasImpact] = await Promise.all([
      this.getWeatherImpact(players),
      this.getVegasImpact(players)
    ]);

    return baseCorrelation * weatherImpact * vegasImpact;
  }

  private getBaseCorrelation(players: Player[]): number {
    const correlations = {
      QB: { WR: 0.75, TE: 0.6, RB: 0.25 },
      RB: { DEF: 0.45 },
      WR: { WR: 0.35, TE: 0.3 },
      TE: { WR: 0.3 }
    };

    let totalCorrelation = 0;
    let pairs = 0;

    for (let i = 0; i < players.length - 1; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const pos1 = players[i].position;
        const pos2 = players[j].position;
        
        const correlation = correlations[pos1]?.[pos2] || 
                          correlations[pos2]?.[pos1] || 0;

        if (correlation !== 0) {
          totalCorrelation += correlation;
          pairs++;
        }
      }
    }

    return pairs > 0 ? totalCorrelation / pairs : 0;
  }

  private async getWeatherImpact(players: Player[]): Promise<number> {
    const team = players[0].team;
    const opponent = players[0].opponent;
    const weather = await this.weatherService.getGameWeather(team, opponent);

    if (weather.isIndoors) return 1.1; // Slight boost for indoor games

    let impact = 1;
    if (weather.windSpeed > 15) {
      impact *= 0.9; // Reduce correlation in high wind
    }
    if (weather.precipitation > 0) {
      impact *= 0.95; // Reduce correlation in rain/snow
    }

    return impact;
  }

  private async getVegasImpact(players: Player[]): Promise<number> {
    const team = players[0].team;
    const opponent = players[0].opponent;
    const vegas = await this.vegasService.getGameOdds(`${team}_${opponent}`);

    let impact = 1;
    if (vegas.total > 50) {
      impact *= 1.1; // Boost correlation in high-scoring games
    }
    if (Math.abs(vegas.spread) > 10) {
      impact *= 0.9; // Reduce correlation in potential blowouts
    }

    return impact;
  }
}