import { Player } from '@/lib/types/dfs';
import { stackBuilder } from './StackBuilder';

interface ContestSettings {
  contestType: 'large-field' | 'mid-size' | 'small-field' | 'cash';
  maxOwnership: number;
  minOwnership: number;
  maxExposure: number;
  uniqueness: number;
  correlationThreshold: number;
}

// Define roster requirements
const ROSTER_REQUIREMENTS = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 1,
  DST: 1,
  FLEX: 1  // RB/WR/TE
};

const SALARY_CAP = 50000;

export class LineupOptimizerService {
  async optimizeLineups(
    players: Player[],
    settings: ContestSettings
  ): Promise<{ lineups: any[]; errors: string[] }> {
    console.log('LineupOptimizerService: Starting optimization with settings:', settings);
    console.log('LineupOptimizerService: Player pool size:', players.length);

    const errors: string[] = [];
    const lineups: any[] = [];
    const targetLineupCount = settings.contestType === 'cash' ? 1 : 20; // Default to 20 lineups for GPP

    try {
      // Validate and clean player pool
      const validPlayers = this.validateAndCleanPlayerPool(players);
      console.log('LineupOptimizerService: Valid players count:', validPlayers.length);

      // Group players by position
      const playersByPosition = this.groupPlayersByPosition(validPlayers);
      console.log('LineupOptimizerService: Players grouped by position:', 
        Object.keys(playersByPosition).map(pos => `${pos}: ${playersByPosition[pos].length}`));

      // Validate we have enough players for each position
      this.validatePositionCounts(playersByPosition);

      // Generate multiple lineups
      let attempts = 0;
      const maxAttempts = targetLineupCount * 2; // Allow some extra attempts for failures

      while (lineups.length < targetLineupCount && attempts < maxAttempts) {
        attempts++;
        const lineup = await this.generateLineup(
          playersByPosition, 
          settings,
          lineups // Pass existing lineups to ensure uniqueness
        );

        if (lineup) {
          lineups.push(lineup);
          console.log(`LineupOptimizerService: Generated lineup ${lineups.length}:`, {
            playerCount: lineup.players.length,
            totalSalary: lineup.totalSalary,
            projectedPoints: lineup.projectedPoints
          });
        } else {
          errors.push(`Failed to generate valid lineup ${lineups.length + 1}`);
          if (lineups.length === 0) {
            throw new Error('Unable to generate any valid lineups');
          }
        }
      }

      if (lineups.length === 0) {
        throw new Error('Failed to generate any valid lineups');
      }

      if (lineups.length < targetLineupCount) {
        errors.push(`Only generated ${lineups.length} of ${targetLineupCount} requested lineups`);
      }

      return { lineups, errors };

    } catch (error) {
      console.error('LineupOptimizerService: Optimization error:', error);
      throw error;
    }
  }

  private validateAndCleanPlayerPool(players: Player[]): Player[] {
    if (!players?.length) {
      throw new Error('No players provided for optimization');
    }

    // Filter out invalid players and log issues
    const validPlayers = players.filter(player => {
      if (!player) return false;

      const issues: string[] = [];
      if (!player.id) issues.push('missing id');
      if (!player.name) issues.push('missing name');
      if (!player.position) issues.push('missing position');
      if (!player.team) issues.push('missing team');
      if (!player.salary || player.salary <= 0) issues.push('invalid salary');
      if (!player.projectedPoints || player.projectedPoints < 0) issues.push('invalid projection');

      if (issues.length > 0) {
        console.warn(`Invalid player data for ${player.name || 'Unknown Player'}: ${issues.join(', ')}`);
        return false;
      }

      return true;
    });

    const invalidCount = players.length - validPlayers.length;
    if (invalidCount > 0) {
      console.warn(`Filtered out ${invalidCount} invalid players`);
    }

    if (validPlayers.length === 0) {
      throw new Error('No valid players found in player pool');
    }

    return validPlayers;
  }

  private validatePositionCounts(playersByPosition: Record<string, Player[]>) {
    const missingPositions: string[] = [];

    // Check required positions
    for (const [position, count] of Object.entries(ROSTER_REQUIREMENTS)) {
      if (position === 'FLEX') continue; // Skip FLEX check here

      const availablePlayers = playersByPosition[position]?.length || 0;
      if (availablePlayers < count) {
        missingPositions.push(`${position} (need ${count}, have ${availablePlayers})`);
      }
    }

    // Check FLEX-eligible players (RB/WR/TE)
    const flexEligibleCount = (playersByPosition['RB']?.length || 0) +
                            (playersByPosition['WR']?.length || 0) +
                            (playersByPosition['TE']?.length || 0);
    
    const totalFlexNeeded = (ROSTER_REQUIREMENTS.RB + ROSTER_REQUIREMENTS.WR + 
                            ROSTER_REQUIREMENTS.TE + ROSTER_REQUIREMENTS.FLEX);
    
    if (flexEligibleCount < totalFlexNeeded) {
      missingPositions.push(`FLEX-eligible (need ${totalFlexNeeded}, have ${flexEligibleCount})`);
    }

    if (missingPositions.length > 0) {
      throw new Error(`Insufficient players for positions: ${missingPositions.join(', ')}`);
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

  private async generateLineup(
    playersByPosition: Record<string, Player[]>,
    settings: ContestSettings,
    existingLineups: any[]
  ) {
    console.log('LineupOptimizerService: Generating lineup');
    
    try {
      const lineup: Player[] = [];
      let remainingSalary = SALARY_CAP;

      // Add required position players first
      for (const [position, count] of Object.entries(ROSTER_REQUIREMENTS)) {
        if (position === 'FLEX') continue; // Handle FLEX separately

        for (let i = 0; i < count; i++) {
          const availablePlayers = playersByPosition[position]?.filter(p => 
            p.salary <= remainingSalary &&
            (p.ownership || 0) <= settings.maxOwnership &&
            !lineup.includes(p) &&
            !this.isOverExposed(p, existingLineups, settings.maxExposure)
          );

          if (!availablePlayers?.length) {
            console.error(`LineupOptimizerService: No valid ${position} players available for slot ${i + 1}`);
            return null;
          }

          // Select player based on uniqueness setting
          const player = this.selectPlayer(availablePlayers, settings.uniqueness);

          lineup.push(player);
          remainingSalary -= player.salary;
          
          console.log(`LineupOptimizerService: Added ${position}:`, {
            name: player.name,
            salary: player.salary,
            projectedPoints: player.projectedPoints
          });
        }
      }

      // Add FLEX player (RB/WR/TE)
      const flexEligiblePlayers = [
        ...(playersByPosition['RB'] || []),
        ...(playersByPosition['WR'] || []),
        ...(playersByPosition['TE'] || [])
      ].filter(p => 
        p.salary <= remainingSalary &&
        (p.ownership || 0) <= settings.maxOwnership &&
        !lineup.includes(p) &&
        !this.isOverExposed(p, existingLineups, settings.maxExposure)
      );

      if (!flexEligiblePlayers.length) {
        console.error('LineupOptimizerService: No valid FLEX players available');
        return null;
      }

      const flexPlayer = this.selectPlayer(flexEligiblePlayers, settings.uniqueness);

      lineup.push(flexPlayer);
      remainingSalary -= flexPlayer.salary;

      console.log('LineupOptimizerService: Added FLEX:', {
        name: flexPlayer.name,
        position: flexPlayer.position,
        salary: flexPlayer.salary,
        projectedPoints: flexPlayer.projectedPoints
      });

      // Validate final lineup
      if (!this.validateLineup(lineup)) {
        console.error('LineupOptimizerService: Invalid lineup');
        return null;
      }

      const totalSalary = lineup.reduce((sum, p) => sum + p.salary, 0);
      const projectedPoints = lineup.reduce((sum, p) => sum + p.projectedPoints, 0);

      return {
        players: lineup,
        totalSalary,
        projectedPoints,
        totalOwnership: lineup.reduce((sum, p) => sum + (p.ownership || 0), 0) / lineup.length
      };

    } catch (error) {
      console.error('LineupOptimizerService: Error generating lineup:', error);
      return null;
    }
  }

  private selectPlayer(players: Player[], uniqueness: number): Player {
    // Sort by projected points and add some randomness based on uniqueness
    return players.sort((a, b) => {
      const randomFactor = Math.random() * uniqueness;
      return (b.projectedPoints + randomFactor) - (a.projectedPoints + randomFactor);
    })[0];
  }

  private isOverExposed(player: Player, existingLineups: any[], maxExposure: number): boolean {
    if (existingLineups.length === 0) return false;

    const appearances = existingLineups.filter(lineup => 
      lineup.players.some(p => p.id === player.id)
    ).length;

    const exposure = (appearances / existingLineups.length) * 100;
    return exposure >= maxExposure;
  }

  private validateLineup(lineup: Player[]): boolean {
    // Check lineup size
    if (lineup.length !== Object.values(ROSTER_REQUIREMENTS).reduce((a, b) => a + b)) {
      return false;
    }

    // Check salary cap
    const totalSalary = lineup.reduce((sum, p) => sum + p.salary, 0);
    if (totalSalary > SALARY_CAP) {
      return false;
    }

    // Check position requirements
    const positions = lineup.map(p => p.position);
    for (const [pos, count] of Object.entries(ROSTER_REQUIREMENTS)) {
      if (pos === 'FLEX') continue;
      if (positions.filter(p => p === pos).length !== count) {
        return false;
      }
    }

    // Check FLEX validity (must be RB/WR/TE)
    const flexPlayer = lineup[lineup.length - 1];
    if (!['RB', 'WR', 'TE'].includes(flexPlayer.position)) {
      return false;
    }

    return true;
  }
}

export const lineupOptimizer = new LineupOptimizerService();