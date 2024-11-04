import { Player } from '@/lib/types/dfs';
import { BaseStats, ProjectionResult } from '@/lib/types/projections';
import { calculateBaseProjection } from '@/lib/utils/projections/baseProjections';

export class BaseProjectionService {
  async generateBaseProjections(players: Player[]): Promise<Map<string, ProjectionResult>> {
    const projections = new Map<string, ProjectionResult>();

    for (const player of players) {
      const baseStats = await this.getHistoricalStats(player);
      const baseProjection = calculateBaseProjection(baseStats);
      
      projections.set(player.id, {
        baseProjection,
        modifiedProjection: baseProjection,
        ceiling: this.calculateCeiling(baseProjection, player.position),
        floor: this.calculateFloor(baseProjection, player.position),
        confidence: 0.7, // Base confidence, will be modified by enhancers
        modifiers: {
          weather: 1,
          vegas: 1,
          social: 1,
          historical: 1,
          gameScript: 1,
          defense: 1
        }
      });
    }

    return projections;
  }

  private async getHistoricalStats(player: Player): Promise<BaseStats> {
    // This would connect to your historical stats database
    // For now, we'll use placeholder logic
    const baseStats: BaseStats = {
      passingYards: 0,
      passingTDs: 0,
      rushingYards: 0,
      rushingTDs: 0,
      receptions: 0,
      receivingYards: 0,
      receivingTDs: 0,
      targets: 0,
      carries: 0
    };

    switch (player.position) {
      case 'QB':
        baseStats.passingYards = 250;
        baseStats.passingTDs = 1.8;
        baseStats.rushingYards = 15;
        baseStats.rushingTDs = 0.1;
        break;
      case 'RB':
        baseStats.rushingYards = 65;
        baseStats.rushingTDs = 0.5;
        baseStats.receptions = 3;
        baseStats.receivingYards = 20;
        baseStats.carries = 14;
        break;
      case 'WR':
        baseStats.receptions = 5;
        baseStats.receivingYards = 65;
        baseStats.receivingTDs = 0.4;
        baseStats.targets = 7;
        break;
      case 'TE':
        baseStats.receptions = 4;
        baseStats.receivingYards = 45;
        baseStats.receivingTDs = 0.3;
        baseStats.targets = 5;
        break;
    }

    return baseStats;
  }

  private calculateCeiling(baseProjection: number, position: string): number {
    const ceilingMultipliers = {
      QB: 1.35,
      RB: 1.45,
      WR: 1.55,
      TE: 1.60,
      DST: 1.75
    };

    return baseProjection * (ceilingMultipliers[position] || 1.4);
  }

  private calculateFloor(baseProjection: number, position: string): number {
    const floorMultipliers = {
      QB: 0.65,
      RB: 0.55,
      WR: 0.45,
      TE: 0.40,
      DST: 0.35
    };

    return baseProjection * (floorMultipliers[position] || 0.5);
  }
}