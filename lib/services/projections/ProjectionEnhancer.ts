import { Player } from '@/lib/types/dfs';
import { SocialMetrics, ProjectionResult } from '@/lib/types/projections';
import { SocialAggregator } from '../social/SocialAggregator';
import { WeatherService } from '../weather/WeatherService';
import { VegasService } from '../vegas/VegasService';
import { generateProjection } from '@/lib/utils/projections';

export class ProjectionEnhancer {
  private socialAggregator: SocialAggregator;
  private weatherService: WeatherService;
  private vegasService: VegasService;

  constructor() {
    this.socialAggregator = new SocialAggregator();
    this.weatherService = new WeatherService();
    this.vegasService = new VegasService();
  }

  async enhanceProjections(players: Player[]): Promise<Player[]> {
    const enhancedPlayers = await Promise.all(
      players.map(async (player) => {
        const [socialMetrics, gameEnvironment] = await Promise.all([
          this.socialAggregator.getAggregatedSentiment(player),
          this.getGameEnvironment(player),
        ]);

        const baseStats = await this.getBaseStats(player);
        const projection = generateProjection(
          baseStats,
          gameEnvironment,
          socialMetrics,
          player.position
        );

        return {
          ...player,
          projectedPoints: projection.modifiedProjection,
          ceiling: projection.ceiling,
          floor: projection.floor,
          socialMetrics: {
            sentiment: socialMetrics.sentiment,
            beatWriterSentiment: socialMetrics.confidence,
            trendingScore: socialMetrics.projectionAdjustment,
            insights: socialMetrics.insights
          }
        };
      })
    );

    return this.normalizeProjections(enhancedPlayers);
  }

  private async getGameEnvironment(player: Player) {
    const [weather, vegas] = await Promise.all([
      this.weatherService.getGameWeather(player.team, player.opponent),
      this.vegasService.getGameLines(player.team, player.opponent)
    ]);

    return {
      weather,
      ...vegas,
      homeGame: player.team === player.opponent.split('@')[1],
      turf: this.isTurfField(player.team)
    };
  }

  private isTurfField(team: string): boolean {
    const turfTeams = ['MIN', 'DET', 'NO', 'ATL', 'DAL', 'HOU', 'IND', 'ARI'];
    return turfTeams.includes(team);
  }

  private async getBaseStats(player: Player) {
    // This would connect to your historical stats database
    // For now, return empty object as placeholder
    return {};
  }

  private normalizeProjections(players: Player[]): Player[] {
    // Normalize projections within position groups
    const positionGroups = players.reduce((groups, player) => {
      if (!groups[player.position]) {
        groups[player.position] = [];
      }
      groups[player.position].push(player);
      return groups;
    }, {});

    Object.values(positionGroups).forEach(group => {
      const maxProj = Math.max(...group.map(p => p.projectedPoints));
      const minProj = Math.min(...group.map(p => p.projectedPoints));
      const range = maxProj - minProj;

      if (range > 0) {
        group.forEach(player => {
          player.projectedPoints = (player.projectedPoints - minProj) / range;
        });
      }
    });

    return players;
  }
}