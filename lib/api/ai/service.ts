import { aiClient } from './client';
import { supabase } from '@/lib/supabase/client';
import { Player } from '@/lib/types/dfs';
import { weatherService } from '../weather/service';
import { vegasService } from '../vegas/service';
import { socialService } from '../social/service';

export class AIService {
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  async getPlayerAnalysis(player: Player) {
    try {
      // Check cache first
      const { data: cachedAnalysis } = await supabase
        .from('ai_analysis_cache')
        .select('*')
        .eq('player_id', player.id)
        .eq('analysis_type', 'player')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (cachedAnalysis) {
        return cachedAnalysis.analysis_data;
      }

      // Gather all required context
      const [
        socialSentiment,
        weatherData,
        vegasData,
        recentPerformance,
        teamContext
      ] = await Promise.all([
        socialService.getPlayerSentiment(player),
        weatherService.getGameWeather(player.team, player.opponent),
        vegasService.getGameOdds(`${player.team}_${player.opponent}`),
        this.getRecentPerformance(player),
        this.getTeamContext(player)
      ]);

      // Get AI analysis
      const analysis = await aiClient.analyzePlayer({
        player,
        socialSentiment,
        weatherData,
        vegasData,
        recentPerformance,
        teamContext
      });

      // Cache the results
      const expiresAt = new Date(Date.now() + this.CACHE_DURATION);
      await supabase
        .from('ai_analysis_cache')
        .upsert({
          player_id: player.id,
          analysis_type: 'player',
          analysis_data: analysis,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });

      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }

  async getCorrelationAnalysis(gameId: string, players: Player[]) {
    try {
      // Check cache
      const { data: cachedAnalysis } = await supabase
        .from('ai_analysis_cache')
        .select('*')
        .eq('game_id', gameId)
        .eq('analysis_type', 'correlation')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (cachedAnalysis) {
        return cachedAnalysis.analysis_data;
      }

      // Get game context
      const [homeTeam, awayTeam] = gameId.split('_');
      const [weatherData, vegasData, historicalCorrelations] = await Promise.all([
        weatherService.getGameWeather(homeTeam, awayTeam),
        vegasService.getGameOdds(gameId),
        this.getHistoricalCorrelations(homeTeam, awayTeam)
      ]);

      // Get AI analysis
      const analysis = await aiClient.analyzeCorrelations({
        game: { teams: [homeTeam, awayTeam] },
        players,
        weatherData,
        vegasData,
        historicalCorrelations
      });

      // Cache the results
      const expiresAt = new Date(Date.now() + this.CACHE_DURATION);
      await supabase
        .from('ai_analysis_cache')
        .upsert({
          game_id: gameId,
          analysis_type: 'correlation',
          analysis_data: analysis,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });

      return analysis;
    } catch (error) {
      console.error('AI correlation analysis error:', error);
      throw error;
    }
  }

  private async getRecentPerformance(player: Player) {
    // Get last 5 games performance
    const { data } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', player.id)
      .order('game_date', { ascending: false })
      .limit(5);

    return data || [];
  }

  private async getTeamContext(player: Player) {
    // Get team-specific context
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('team', player.team)
      .eq('status', 'ACTIVE');

    return data || [];
  }

  private async getHistoricalCorrelations(homeTeam: string, awayTeam: string) {
    // Get historical correlation data
    const { data } = await supabase
      .from('historical_correlations')
      .select('*')
      .or(`home_team.eq.${homeTeam},away_team.eq.${awayTeam}`);

    return data || [];
  }
}

export const aiService = new AIService();