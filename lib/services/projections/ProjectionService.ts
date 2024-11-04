import { Player } from '@/lib/types/dfs';
import { WeatherService } from '../weather/WeatherService';
import { VegasService } from '../vegas/VegasService';
import { cacheService } from '../cache/CacheService';
import { ProjectionResult } from '@/lib/types/projections';

export class ProjectionService {
  private weatherService: WeatherService;
  private vegasService: VegasService;
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.weatherService = new WeatherService();
    this.vegasService = new VegasService();
  }

  async enhanceProjections(players: Player[]): Promise<Player[]> {
    return Promise.all(players.map(async (player) => {
      const cacheKey = cacheService.generateKey('projection', {
        playerId: player.id,
        baseProjection: player.projectedPoints
      });

      // Check cache first
      const cached = await cacheService.get<ProjectionResult>(cacheKey);
      if (cached) {
        return this.applyProjection(player, cached);
      }

      // Get weather and Vegas data
      const [weather, vegas] = await Promise.all([
        this.weatherService.getGameWeather(player.team, player.opponent),
        this.vegasService.getGameOdds(`${player.team}_${player.opponent}`)
      ]);

      // Calculate impacts
      const weatherImpact = this.weatherService.getWeatherImpact(weather, player.position);
      const vegasImpact = this.vegasService.getVegasImpact(vegas, player.position);

      // Calculate modified projection
      const projection = this.calculateProjection(player, weatherImpact, vegasImpact);

      // Generate insights
      const insights = [
        ...this.weatherService.getWeatherInsights(player.position, weather),
        ...this.vegasService.getVegasInsights(player.position, vegas),
        ...this.vegasService.getGameScriptInsights(player, vegas)
      ];

      // Cache the result
      const result = {
        ...projection,
        insights,
        modifiers: {
          weather: weatherImpact,
          vegas: vegasImpact
        }
      };

      await cacheService.set(cacheKey, result, this.CACHE_TTL);
      return this.applyProjection(player, result);
    }));
  }

  private calculateProjection(
    player: Player,
    weatherImpact: number,
    vegasImpact: number
  ): ProjectionResult {
    const baseProjection = player.projectedPoints;
    const modifiedProjection = baseProjection * weatherImpact * vegasImpact;

    // Calculate ceiling and floor based on position volatility
    const volatility = this.getPositionVolatility(player.position);
    const ceiling = modifiedProjection * (1 + volatility);
    const floor = modifiedProjection * (1 - volatility);

    // Calculate confidence based on impacts
    const confidence = this.calculateConfidence(weatherImpact, vegasImpact);

    return {
      baseProjection,
      modifiedProjection,
      ceiling,
      floor,
      confidence
    };
  }

  private getPositionVolatility(position: string): number {
    const volatilities = {
      'QB': 0.25,  // More consistent scoring
      'RB': 0.30,  // Moderate volatility
      'WR': 0.35,  // Higher volatility due to big plays
      'TE': 0.40,  // Very volatile scoring
      'DST': 0.45  // Most volatile
    };
    return volatilities[position] || 0.35;
  }

  private calculateConfidence(weatherImpact: number, vegasImpact: number): number {
    // Base confidence of 0.7
    let confidence = 0.7;

    // Adjust based on weather impact
    if (weatherImpact < 0.9) {
      confidence *= 0.8; // Reduce confidence in bad weather
    } else if (weatherImpact > 1.05) {
      confidence *= 1.1; // Increase confidence in good conditions
    }

    // Adjust based on Vegas impact
    if (vegasImpact > 1.05) {
      confidence *= 1.1; // Increase confidence in favorable game environments
    } else if (vegasImpact < 0.95) {
      confidence *= 0.9; // Reduce confidence in unfavorable game environments
    }

    // Ensure confidence stays between 0 and 1
    return Math.min(1, Math.max(0, confidence));
  }

  private applyProjection(player: Player, projection: ProjectionResult): Player {
    return {
      ...player,
      projectedPoints: projection.modifiedProjection,
      ceiling: projection.ceiling,
      floor: projection.floor,
      insights: projection.insights,
      modifiers: projection.modifiers
    };
  }
}

export const projectionService = new ProjectionService();