import { Player } from '@/lib/types/dfs';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class LineupValidator {
  validateLineup(
    players: Player[],
    salaryCap: number,
    rosterRules: any
  ): ValidationResult {
    const errors: string[] = [];

    // Check salary cap
    const totalSalary = players.reduce((sum, p) => sum + p.salary, 0);
    if (totalSalary > salaryCap) {
      errors.push(`Lineup exceeds salary cap by ${totalSalary - salaryCap}`);
    }

    // Check roster positions
    const positions = players.map(p => p.position);
    if (!this.validateRosterPositions(positions, rosterRules)) {
      errors.push('Invalid roster construction');
    }

    // Check for duplicates
    if (this.hasDuplicatePlayers(players)) {
      errors.push('Lineup contains duplicate players');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateRosterPositions(
    positions: string[],
    rules: any
  ): boolean {
    // Implement position validation logic
    return true;
  }

  private hasDuplicatePlayers(players: Player[]): boolean {
    const seen = new Set<string>();
    return players.some(p => {
      if (seen.has(p.id)) return true;
      seen.add(p.id);
      return false;
    });
  }
}

export const lineupValidator = new LineupValidator();