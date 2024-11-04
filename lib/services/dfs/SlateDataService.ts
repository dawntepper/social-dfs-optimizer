import { Player } from '@/lib/types/dfs';

export class SlateDataService {
  private static instance: SlateDataService;
  private slateData: Map<string, any> = new Map();
  private playerPool: Player[] = [];

  private constructor() {}

  static getInstance(): SlateDataService {
    if (!SlateDataService.instance) {
      SlateDataService.instance = new SlateDataService();
    }
    return SlateDataService.instance;
  }

  loadSlateData(csvContent: string) {
    try {
      // Parse CSV and populate player pool
      this.playerPool = this.parseCSV(csvContent);
      console.log(`Loaded ${this.playerPool.length} players from slate data`);

      // Validate player pool
      this.validatePlayerPool();
    } catch (error) {
      console.error('Error loading slate data:', error);
      throw error;
    }
  }

  getPlayerPool(): Player[] {
    return this.playerPool;
  }

  getPlayers(team: string): Player[] {
    return this.playerPool.filter(p => p.team === team);
  }

  getAllTeams(): string[] {
    return Array.from(new Set(this.playerPool.map(p => p.team))).sort();
  }

  private parseCSV(content: string): Player[] {
    const lines = content.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',');
    const players: Player[] = [];

    // Map column indices
    const columnMap = {
      name: headers.findIndex(h => h.includes('name')),
      position: headers.findIndex(h => h.includes('position')),
      salary: headers.findIndex(h => h.includes('salary')),
      team: headers.findIndex(h => /team|teamabbrev/i.test(h)),
      opponent: headers.findIndex(h => h.includes('opponent')),
      fppg: headers.findIndex(h => /fppg|proj|points/i.test(h)),
      status: headers.findIndex(h => h.includes('status'))
    };

    // Validate required columns exist
    const requiredColumns = ['name', 'position', 'salary', 'team'];
    const missingColumns = requiredColumns.filter(col => columnMap[col] === -1);
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      if (values.length !== headers.length) {
        console.warn(`Skipping malformed line ${i + 1}: incorrect number of columns`);
        continue;
      }

      try {
        const player = this.createPlayerFromValues(values, columnMap, i);
        if (this.validatePlayer(player)) {
          players.push(player);
        }
      } catch (error) {
        console.warn(`Error parsing player on line ${i + 1}:`, error);
      }
    }

    return players;
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
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    return values;
  }

  private createPlayerFromValues(
    values: string[], 
    columnMap: Record<string, number>, 
    index: number
  ): Player {
    const getValue = (key: string) => {
      const idx = columnMap[key];
      return idx >= 0 ? values[idx].trim() : '';
    };

    const name = getValue('name');
    const position = getValue('position');
    const team = getValue('team');
    const opponent = getValue('opponent');
    const status = getValue('status');
    
    // Parse salary, removing any non-numeric characters
    const salaryStr = getValue('salary').replace(/[^0-9.-]/g, '');
    const salary = parseInt(salaryStr, 10);

    // Parse projected points
    const projStr = getValue('fppg').replace(/[^0-9.-]/g, '');
    const projectedPoints = parseFloat(projStr) || 0;

    // Generate a deterministic ID
    const id = `${team}-${position}-${name}-${index}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    return {
      id,
      name,
      position,
      team,
      opponent,
      salary,
      projectedPoints,
      status: status || 'ACTIVE',
      ownership: Math.random() * 20, // Mock ownership for now
      value: projectedPoints / (salary / 1000)
    };
  }

  private validatePlayer(player: Player): boolean {
    // Required fields
    if (!player.name || !player.position || !player.team || !player.salary) {
      return false;
    }

    // Valid position
    const validPositions = ['QB', 'RB', 'WR', 'TE', 'DST'];
    if (!validPositions.includes(player.position)) {
      return false;
    }

    // Valid salary range (100 to 100,000)
    if (player.salary < 100 || player.salary > 100000) {
      return false;
    }

    // Valid projected points (non-negative)
    if (player.projectedPoints < 0) {
      return false;
    }

    return true;
  }

  private validatePlayerPool() {
    const positions = ['QB', 'RB', 'WR', 'TE', 'DST'];
    const counts = new Map<string, number>();

    // Count players by position
    this.playerPool.forEach(player => {
      counts.set(player.position, (counts.get(player.position) || 0) + 1);
    });

    // Check minimum requirements
    const minimumRequired = {
      QB: 2,  // Need at least 2 QBs
      RB: 4,  // Need at least 4 RBs (2 starters + depth)
      WR: 6,  // Need at least 6 WRs (3 starters + depth)
      TE: 2,  // Need at least 2 TEs
      DST: 1  // Need at least 1 DST
    };

    const missingPositions = positions.filter(pos => 
      (counts.get(pos) || 0) < minimumRequired[pos]
    );

    if (missingPositions.length > 0) {
      const details = missingPositions.map(pos => 
        `${pos} (have ${counts.get(pos) || 0}, need ${minimumRequired[pos]})`
      ).join(', ');
      
      throw new Error(`Insufficient players for positions: ${details}`);
    }
  }
}

export const slateService = SlateDataService.getInstance();