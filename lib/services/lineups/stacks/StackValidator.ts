import { Player } from '@/lib/types/dfs';

export class StackValidator {
  validateInput(players: Player[]): void {
    if (!Array.isArray(players)) {
      throw new Error('Invalid players data: expected an array');
    }

    if (players.length === 0) {
      throw new Error('No players provided for stack building');
    }

    this.validatePlayerData(players);
  }

  private validatePlayerData(players: Player[]): void {
    const invalidPlayers = players.filter(player => {
      return !this.isValidPlayer(player);
    });

    if (invalidPlayers.length > 0) {
      throw new Error(
        `Invalid player data found for ${invalidPlayers.length} players. ` +
        'Each player must have name, position, team, salary, and projected points.'
      );
    }
  }

  private isValidPlayer(player: Player): boolean {
    return Boolean(
      player &&
      player.name &&
      player.position &&
      player.team &&
      typeof player.salary === 'number' &&
      typeof player.projectedPoints === 'number' &&
      player.salary > 0 &&
      player.projectedPoints >= 0
    );
  }
}

export const stackValidator = new StackValidator();