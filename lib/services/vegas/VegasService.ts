import { VegasClient } from './VegasClient';
import { cacheService } from '../cache/CacheService';

export class VegasService {
  private client: VegasClient;
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.client = new VegasClient();
  }

  async getGameOdds(gameId: string) {
    try {
      const cacheKey = cacheService.generateKey('vegas', { gameId });
      
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get fresh data or mock if API key not available
      const odds = process.env.VEGAS_ODDS_API_KEY 
        ? await this.client.getGameOdds(gameId)
        : this.getMockOdds(gameId);

      // Cache the result
      await cacheService.set(cacheKey, odds, this.CACHE_TTL);

      return odds;
    } catch (error) {
      console.error('Vegas service error:', error);
      return this.getMockOdds(gameId);
    }
  }

  private getMockOdds(gameId: string) {
    const [awayTeam, homeTeam] = gameId.split('_');
    const isHighScoring = ['KC', 'BUF', 'SF', 'MIA', 'DAL'].includes(homeTeam);
    
    const total = isHighScoring ? 51.5 : 44.5;
    const spread = -3 + (Math.random() * 6 - 3); // Random spread between -6 and 0
    
    return {
      total,
      spread,
      homeTeamTotal: (total / 2) + (-spread / 2),
      awayTeamTotal: (total / 2) + (spread / 2),
      moneyline: {
        home: -150,
        away: +130
      }
    };
  }

  getVegasImpact(vegas: any, position: string): number {
    let impact = 1;

    // High team total boost
    if (vegas.homeTeamTotal > 26) {
      impact *= 1.05;
    }

    // Game script impacts
    if (position === 'RB') {
      if (vegas.spread > 7) { // Favored team
        impact *= 1.08;
      } else if (vegas.spread < -7) { // Underdog
        impact *= 0.92;
      }
    }

    if (['WR', 'TE'].includes(position)) {
      if (vegas.spread < -7) { // Trailing team
        impact *= 1.05;
      }
    }

    return impact;
  }

  getVegasInsights(position: string, vegas: any): string[] {
    const insights: string[] = [];

    if (vegas.homeTeamTotal > 26) {
      insights.push(`High team total (${vegas.homeTeamTotal.toFixed(1)}) suggests favorable scoring conditions`);
    }

    if (position === 'RB') {
      if (vegas.spread > 7) {
        insights.push('Positive game script favors rushing volume');
      } else if (vegas.spread < -7) {
        insights.push('Negative game script may limit rushing opportunities');
      }
    }

    if (['WR', 'TE'].includes(position) && vegas.spread < -7) {
      insights.push('Negative game script could increase passing volume');
    }

    return insights;
  }

  getGameScriptInsights(player: any, vegas: any): string[] {
    const insights: string[] = [];
    const isHome = !player.opponent.includes('@');
    const teamTotal = isHome ? vegas.homeTeamTotal : vegas.awayTeamTotal;

    if (teamTotal > 26) {
      insights.push(`Team implied total of ${teamTotal.toFixed(1)} points indicates strong scoring potential`);
    }

    if (Math.abs(vegas.spread) > 10) {
      insights.push(`Large spread (${vegas.spread.toFixed(1)}) suggests potential game script impact`);
    }

    return insights;
  }
}

export const vegasService = new VegasService();