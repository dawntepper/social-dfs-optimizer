import { ESPNPlayer, ESPNTeam, ESPNPositions, ESPNStatsMapping } from '@/lib/types/espn';
import { Player } from '@/lib/types/dfs';
import { RateLimiter } from '@/lib/utils/RateLimiter';

export class ESPNService {
  private readonly BASE_URL = 'https://fantasy.espn.com/apis/v3/games/ffl';
  private readonly SEASON = 2024;
  private readonly SCORING_PERIOD = 1; // Week number
  private rateLimiter: RateLimiter;

  constructor() {
    // Limit to 100 requests per minute
    this.rateLimiter = new RateLimiter(100, 60000);
  }

  async getPlayers(): Promise<Player[]> {
    await this.rateLimiter.waitForToken();

    try {
      const response = await fetch(
        `${this.BASE_URL}/seasons/${this.SEASON}/segments/0/leagues/0/players?scoringPeriodId=${this.SCORING_PERIOD}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('ESPN API rate limit exceeded. Please try again later.');
        }
        throw new Error(`ESPN API Error: ${response.status} ${response.statusText}`);
      }

      const players: ESPNPlayer[] = await response.json();
      return this.transformPlayers(players);
    } catch (error) {
      console.error('ESPN API Error:', error);
      throw new Error(`Failed to fetch players: ${error.message}`);
    }
  }

  async getTeams(): Promise<ESPNTeam[]> {
    await this.rateLimiter.waitForToken();

    try {
      const response = await fetch(
        `${this.BASE_URL}/seasons/${this.SEASON}/segments/0/leagues/0/teams`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('ESPN API rate limit exceeded. Please try again later.');
        }
        throw new Error(`ESPN API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ESPN API Error:', error);
      throw new Error(`Failed to fetch teams: ${error.message}`);
    }
  }

  async getNews(playerId: string): Promise<any[]> {
    await this.rateLimiter.waitForToken();

    try {
      const response = await fetch(
        `${this.BASE_URL}/seasons/${this.SEASON}/segments/0/leagues/0/players/${playerId}/news`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch player news');
      }

      return await response.json();
    } catch (error) {
      console.error('ESPN News API Error:', error);
      return [];
    }
  }

  private transformPlayers(espnPlayers: ESPNPlayer[]): Player[] {
    return espnPlayers
      .filter(p => this.isRelevantPosition(p.defaultPositionId))
      .map(p => this.transformPlayer(p));
  }

  private transformPlayer(espnPlayer: ESPNPlayer): Player {
    const currentStats = espnPlayer.stats.find(s => 
      s.seasonId === this.SEASON && s.scoringPeriodId === this.SCORING_PERIOD
    );

    return {
      id: espnPlayer.id,
      name: espnPlayer.fullName,
      position: this.getPosition(espnPlayer.defaultPositionId),
      team: this.getTeamAbbrev(espnPlayer.proTeamId),
      opponent: '', // Need to get from schedule data
      salary: 0, // Will be populated from DK/FD data
      projectedPoints: currentStats?.appliedTotal || 0,
      status: espnPlayer.injuryStatus || (espnPlayer.injured ? 'Injured' : 'Active'),
      actualPoints: currentStats?.appliedTotal || 0
    };
  }

  private isRelevantPosition(positionId: number): boolean {
    return Object.values(ESPNPositions).includes(positionId);
  }

  private getPosition(positionId: number): string {
    return Object.entries(ESPNPositions).find(([_, id]) => id === positionId)?.[0] || 'Unknown';
  }

  private getTeamAbbrev(teamId: number): string {
    const teamMap = {
      1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE',
      6: 'DAL', 7: 'DEN', 8: 'DET', 9: 'GB', 10: 'TEN',
      11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA',
      16: 'MIN', 17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ',
      21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC', 25: 'SF',
      26: 'SEA', 27: 'TB', 28: 'WSH', 29: 'CAR', 30: 'JAX',
      33: 'BAL', 34: 'HOU'
    };
    return teamMap[teamId] || 'UNK';
  }
}