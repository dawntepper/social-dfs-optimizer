import { RateLimiter } from '@/lib/utils/RateLimiter';

export class VegasClient {
  private readonly API_KEY = process.env.VEGAS_ODDS_API_KEY!;
  private readonly BASE_URL = 'https://api.the-odds-api.com/v4/sports';
  private rateLimiter: RateLimiter;

  constructor() {
    // Limit to 500 requests per month (free tier)
    this.rateLimiter = new RateLimiter(500, 30 * 24 * 60 * 60 * 1000);
  }

  async getGameOdds(gameId: string) {
    await this.rateLimiter.waitForToken();

    try {
      const response = await fetch(
        `${this.BASE_URL}/americanfootball_nfl/odds/?apiKey=${this.API_KEY}&regions=us&markets=spreads,totals&oddsFormat=american`
      );

      if (!response.ok) {
        throw new Error(`Vegas API Error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformOddsData(data, gameId);
    } catch (error) {
      console.error('Vegas API Error:', error);
      throw error;
    }
  }

  private transformOddsData(data: any[], gameId: string) {
    const [awayTeam, homeTeam] = gameId.split('_');
    const game = data.find(g => 
      g.away_team === awayTeam && g.home_team === homeTeam
    );
    
    if (!game) {
      throw new Error(`No odds found for game: ${gameId}`);
    }

    const spread = game.bookmakers[0]?.markets.find(m => m.key === 'spreads');
    const totals = game.bookmakers[0]?.markets.find(m => m.key === 'totals');

    return {
      total: totals?.outcomes[0]?.point || 48.5,
      spread: spread?.outcomes[0]?.point || -3,
      homeTeamTotal: this.calculateTeamTotal(totals?.outcomes[0]?.point, spread?.outcomes[0]?.point, true),
      awayTeamTotal: this.calculateTeamTotal(totals?.outcomes[0]?.point, spread?.outcomes[0]?.point, false),
      commenceTime: game.commence_time || new Date().toISOString()
    };
  }

  private calculateTeamTotal(total: number = 48.5, spread: number = -3, isHome: boolean): number {
    const adjustedSpread = isHome ? -spread : spread;
    return Number(((total / 2) + (adjustedSpread / 2)).toFixed(1));
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.rateLimiter.waitForToken();
      const response = await fetch(
        `${this.BASE_URL}/upcoming/odds/?apiKey=${this.API_KEY}&regions=us&markets=h2h&oddsFormat=american`
      );

      if (!response.ok) {
        throw new Error(`Vegas API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: `Successfully connected to Vegas Odds API. Found ${data.length} upcoming events.`
      };
    } catch (error) {
      console.error('Vegas API Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to Vegas API'
      };
    }
  }
}