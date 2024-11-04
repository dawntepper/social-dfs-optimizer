import { Player } from '@/lib/types/dfs';

export class StackCorrelator {
  private readonly POSITION_CORRELATIONS = {
    QB: {
      WR: 0.75,
      WR2: 0.65,
      TE: 0.60,
      RB: 0.25
    },
    RB: {
      DEF: 0.45,
      WR: -0.20,
      TE: 0.15
    },
    WR: {
      WR2: 0.35,
      TE: 0.30,
      RB: -0.15
    },
    TE: {
      WR: 0.30,
      RB: 0.10
    }
  };

  calculateStackCorrelation(players: Player[]): number {
    let totalCorrelation = 0;
    let pairs = 0;

    for (let i = 0; i < players.length - 1; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const correlation = this.getPositionCorrelation(
          players[i].position,
          players[j].position
        );

        if (correlation !== 0) {
          totalCorrelation += correlation;
          pairs++;
        }
      }
    }

    return pairs > 0 ? totalCorrelation / pairs : 0;
  }

  private getPositionCorrelation(pos1: string, pos2: string): number {
    if (this.POSITION_CORRELATIONS[pos1]?.[pos2]) {
      return this.POSITION_CORRELATIONS[pos1][pos2];
    }
    if (this.POSITION_CORRELATIONS[pos2]?.[pos1]) {
      return this.POSITION_CORRELATIONS[pos2][pos1];
    }
    return 0;
  }
}

export const stackCorrelator = new StackCorrelator();