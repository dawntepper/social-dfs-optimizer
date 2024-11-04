import { ESPNPlayer, ESPNTeam } from '@/lib/types/espn';
import { RateLimiter } from '@/lib/utils/RateLimiter';

export class ESPNClient {
  private readonly BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
  private rateLimiter: RateLimiter;

  constructor() {
    // Limit to 100 requests per minute
    this.rateLimiter = new RateLimiter(100, 60000);
  }

  async getPlayers(): Promise<ESPNPlayer[]> {
    await this.rateLimiter.waitForToken();

    try {
      const response = await fetch(`${this.BASE_URL}/teams`);
      if (!response.ok) {
        throw new Error(`ESPN API Error: ${response.status}`);
      }

      const data = await response.json();
      const players: ESPNPlayer[] = [];

      // Extract players from each team
      data.sports[0].leagues[0].teams.forEach((team: any) => {
        team.athletes?.forEach((athlete: any) => {
          players.push(this.transformPlayer(athlete, team));
        });
      });

      return players;
    } catch (error) {
      console.error('ESPN API Error:', error);
      throw error;
    }
  }

  async getTeams(): Promise<ESPNTeam[]> {
    await this.rateLimiter.waitForToken();

    try {
      const response = await fetch(`${this.BASE_URL}/teams`);
      if (!response.ok) {
        throw new Error(`ESPN API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.sports[0].leagues[0].teams.map(this.transformTeam);
    } catch (error) {
      console.error('ESPN API Error:', error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string): Promise<any> {
    await this.rateLimiter.waitForToken();

    try {
      const response = await fetch(`${this.BASE_URL}/athletes/${playerId}/stats`);
      if (!response.ok) {
        throw new Error(`ESPN API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ESPN API Error:', error);
      throw error;
    }
  }

  private transformPlayer(athlete: any, team: any): ESPNPlayer {
    return {
      id: athlete.id,
      fullName: athlete.fullName,
      position: athlete.position.abbreviation,
      team: team.abbreviation,
      injured: athlete.injured || false,
      stats: athlete.statistics || [],
      injuryStatus: athlete.injuries?.[0]?.status || undefined
    };
  }

  private transformTeam(team: any): ESPNTeam {
    return {
      id: team.id,
      name: team.name,
      abbreviation: team.abbreviation,
      location: team.location,
      byeWeek: team.byeWeek
    };
  }
}

// Export singleton instance
export const espnClient = new ESPNClient();