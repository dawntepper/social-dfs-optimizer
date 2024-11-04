import { vegasClient } from './client';
import { supabase } from '@/lib/supabase/client';

export class VegasService {
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  async getGameOdds(gameId: string) {
    try {
      // Check cache first
      const { data: cachedOdds } = await supabase
        .from('vegas_data')
        .select('*')
        .eq('game_id', gameId)
        .single();

      const cacheExpired = !cachedOdds || 
        (Date.now() - new Date(cachedOdds.created_at).getTime() > this.CACHE_DURATION);

      if (!cacheExpired && cachedOdds) {
        return {
          total: cachedOdds.total,
          spread: cachedOdds.spread,
          teamTotal: cachedOdds.team_total
        };
      }

      // Get fresh odds data
      const allOdds = await vegasClient.getNFLOdds();
      const gameOdds = allOdds.find(odds => odds.gameId === gameId);

      if (!gameOdds) {
        throw new Error(`No odds found for game: ${gameId}`);
      }

      // Cache all games' odds
      const oddsData = allOdds.map(odds => ({
        game_id: odds.gameId,
        total: odds.total,
        spread: odds.spread,
        team_total: odds.homeTeamTotal,
        created_at: new Date().toISOString()
      }));

      await supabase.from('vegas_data').upsert(oddsData);

      return {
        total: gameOdds.total,
        spread: gameOdds.spread,
        teamTotal: gameOdds.homeTeamTotal
      };
    } catch (error) {
      console.error('Vegas service error:', error);
      throw error;
    }
  }

  getVegasImpact(vegas: any, position: string): number {
    let impact = 1;

    // High team total boost
    if (vegas.teamTotal > 26) {
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
}

export const vegasService = new VegasService();