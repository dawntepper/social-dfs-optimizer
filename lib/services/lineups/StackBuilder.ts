import { Player } from '@/lib/types/dfs';
import { StackValidator } from './stacks/StackValidator';
import { StackCorrelator } from './stacks/StackCorrelator';
import { StackSorter } from './stacks/StackSorter';

export interface Stack {
  id: string;
  players: Player[];
  correlation: number;
  totalSalary: number;
  projectedPoints: number;
  leverageScore: number;
  team: string;
  positions: string[];
}

export class StackBuilder {
  private validator: StackValidator;
  private correlator: StackCorrelator;
  private sorter: StackSorter;

  constructor() {
    this.validator = new StackValidator();
    this.correlator = new StackCorrelator();
    this.sorter = new StackSorter();
  }

  async buildTopStacks(players: Player[], contestType: string = 'gpp'): Promise<Stack[]> {
    try {
      // Validate input data
      this.validator.validateInput(players);

      // Group players by team
      const teamPlayers = this.groupPlayersByTeam(players);
      const stacks: Stack[] = [];

      // Build stacks for each team
      for (const [team, players] of Object.entries(teamPlayers)) {
        const teamStacks = await this.buildTeamStacks(team, players);
        stacks.push(...teamStacks);
      }

      // Validate we have stacks
      if (stacks.length === 0) {
        throw new Error('No valid stacks could be created');
      }

      // Sort and limit to top 20 stacks
      const sortedStacks = this.sorter.sortStacks(stacks, contestType);
      return sortedStacks.slice(0, 20);
    } catch (error) {
      console.error('Stack building error:', error);
      throw error;
    }
  }

  private groupPlayersByPosition(players: Player[]): Record<string, Player[]> {
    return players.reduce((acc, player) => {
      if (!acc[player.position]) {
        acc[player.position] = [];
      }
      acc[player.position].push(player);
      return acc;
    }, {} as Record<string, Player[]>);
  }

  private groupPlayersByTeam(players: Player[]): Record<string, Player[]> {
    return players.reduce((acc, player) => {
      if (!acc[player.team]) {
        acc[player.team] = [];
      }
      acc[player.team].push(player);
      return acc;
    }, {} as Record<string, Player[]>);
  }

  private async buildTeamStacks(team: string, players: Player[]): Promise<Stack[]> {
    const stacks: Stack[] = [];
    const positionGroups = this.groupPlayersByPosition(players);

    // QB-based stacks
    if (positionGroups['QB']?.length > 0) {
      const qb = positionGroups['QB'][0]; // Take the highest projected QB
      
      // QB + WR
      if (positionGroups['WR']?.length > 0) {
        stacks.push(this.createStack(
          [qb, positionGroups['WR'][0]],
          team,
          'QB-WR'
        ));

        // QB + WR + WR (if enough WRs)
        if (positionGroups['WR'].length > 1) {
          stacks.push(this.createStack(
            [qb, positionGroups['WR'][0], positionGroups['WR'][1]],
            team,
            'QB-WR-WR'
          ));
        }
      }

      // QB + TE
      if (positionGroups['TE']?.length > 0) {
        stacks.push(this.createStack(
          [qb, positionGroups['TE'][0]],
          team,
          'QB-TE'
        ));
      }

      // QB + WR + TE
      if (positionGroups['WR']?.length > 0 && positionGroups['TE']?.length > 0) {
        stacks.push(this.createStack(
          [qb, positionGroups['WR'][0], positionGroups['TE'][0]],
          team,
          'QB-WR-TE'
        ));
      }
    }

    // RB + DEF stacks
    if (positionGroups['RB']?.length > 0 && positionGroups['DST']?.length > 0) {
      stacks.push(this.createStack(
        [positionGroups['RB'][0], positionGroups['DST'][0]],
        team,
        'RB-DEF'
      ));
    }

    return stacks;
  }

  private createStack(players: Player[], team: string, type: string): Stack {
    const correlation = this.correlator.calculateStackCorrelation(players);
    const totalSalary = players.reduce((sum, p) => sum + p.salary, 0);
    const projectedPoints = players.reduce((sum, p) => sum + p.projectedPoints, 0);
    const leverageScore = this.calculateLeverageScore(players);

    return {
      id: `${team}-${type}-${Date.now()}`,
      players,
      correlation,
      totalSalary,
      projectedPoints,
      leverageScore,
      team,
      positions: players.map(p => p.position)
    };
  }

  private calculateLeverageScore(players: Player[]): number {
    const avgOwnership = players.reduce((sum, p) => sum + (p.ownership || 0), 0) / players.length;
    const projectedPoints = players.reduce((sum, p) => sum + p.projectedPoints, 0);
    
    const ownershipFactor = Math.max(0.1, 1 - (avgOwnership / 100));
    const pointsFactor = Math.min(1, projectedPoints / 100);
    
    return ownershipFactor * pointsFactor;
  }
}

export const stackBuilder = new StackBuilder();