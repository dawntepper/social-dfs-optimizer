import { Player, CSVMapping, DraftKingsMapping, DraftKingsNFLPositions } from '@/lib/types/dfs';
import { nanoid } from 'nanoid';

interface CSVValidationError {
  row: number;
  message: string;
}

export class CSVProcessor {
  private mapping: CSVMapping;
  private site: 'draftkings' | 'fanduel';
  private sport: 'nfl' | 'nba';

  constructor(site: 'draftkings' | 'fanduel' = 'draftkings', sport: 'nfl' | 'nba' = 'nfl') {
    this.site = site;
    this.sport = sport;
    this.mapping = site === 'draftkings' ? DraftKingsMapping : DraftKingsMapping; // Add FanDuel mapping when needed
  }

  async parseCSVFile(file: File): Promise<{ players: Player[], errors: CSVValidationError[] }> {
    const text = await this.readFileAsText(file);
    const lines = text.split('\n');
    const headers = this.normalizeHeaders(lines[0]);
    const errors: CSVValidationError[] = [];
    const players: Player[] = [];

    // Validate headers
    const missingRequired = this.validateHeaders(headers);
    if (missingRequired.length > 0) {
      throw new Error(`Missing required columns: ${missingRequired.join(', ')}`);
    }

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const player = this.processLine(line, headers);
        if (this.isValidPosition(player.position)) {
          players.push(player);
        } else {
          errors.push({
            row: i + 1,
            message: `Invalid position: ${player.position}`
          });
        }
      } catch (error) {
        errors.push({
          row: i + 1,
          message: error.message
        });
      }
    }

    // Additional validations
    this.validatePlayers(players, errors);

    return { players, errors };
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private normalizeHeaders(headerLine: string): string[] {
    return headerLine
      .split(',')
      .map(header => header.trim().toLowerCase());
  }

  private validateHeaders(headers: string[]): string[] {
    const missingRequired: string[] = [];

    Object.entries(this.mapping).forEach(([field, config]) => {
      if (config.required) {
        const found = config.aliases.some(alias => 
          headers.includes(alias.toLowerCase())
        );
        if (!found) {
          missingRequired.push(field);
        }
      }
    });

    return missingRequired;
  }

  private processLine(line: string, headers: string[]): Player {
    const values = this.parseCSVLine(line);
    const player: Partial<Player> = {
      id: nanoid(),
      site: this.site,
      isSelected: false,
      isExcluded: false
    };

    Object.entries(this.mapping).forEach(([field, config]) => {
      const columnIndex = this.findColumnIndex(headers, config.aliases);
      if (columnIndex === -1) {
        if (config.required) {
          throw new Error(`Missing required field: ${field}`);
        }
        return;
      }

      const value = values[columnIndex]?.trim();
      if (!value && config.required) {
        throw new Error(`Empty required field: ${field}`);
      }

      player[field] = config.transform ? config.transform(value) : value;
    });

    // Extract opponent from game info if needed
    if (player.gameInfo && !player.opponent) {
      const teams = player.gameInfo.split(/[@vs]/);
      if (teams.length === 2) {
        player.opponent = teams[1].trim();
      }
    }

    // Calculate value metric
    if (player.projectedPoints && player.salary) {
      player.value = (player.projectedPoints * 1000) / player.salary;
    }

    return player as Player;
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue);
    return values;
  }

  private findColumnIndex(headers: string[], aliases: string[]): number {
    const lowerAliases = aliases.map(a => a.toLowerCase());
    return headers.findIndex(h => lowerAliases.includes(h));
  }

  private isValidPosition(position: string): boolean {
    if (this.sport === 'nfl') {
      return Object.keys(DraftKingsNFLPositions).includes(position);
    }
    return true; // Add NBA position validation when needed
  }

  private validatePlayers(players: Player[], errors: CSVValidationError[]) {
    // Check for duplicate players
    const seen = new Set<string>();
    players.forEach((player, index) => {
      const key = `${player.name}-${player.position}-${player.team}`;
      if (seen.has(key)) {
        errors.push({
          row: index + 1,
          message: `Duplicate player: ${player.name}`
        });
      }
      seen.add(key);
    });

    // Validate salary cap
    const totalSalary = players.reduce((sum, p) => sum + p.salary, 0);
    const maxSalary = this.site === 'draftkings' ? 50000 : 60000;
    if (totalSalary > maxSalary * 1.5) { // Allow some buffer for lineup building
      errors.push({
        row: 0,
        message: `Total salary exceeds maximum allowed: ${totalSalary}`
      });
    }
  }
}

export const validateCSVFile = (file: File): boolean => {
  if (!file) return false;
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    throw new Error('Invalid file type. Please upload a CSV file.');
  }
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File too large. Maximum size is 5MB.');
  }
  return true;
};