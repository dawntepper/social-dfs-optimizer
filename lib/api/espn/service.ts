import { espnClient } from './client';
import { supabase } from '@/lib/supabase/client';
import { ESPNPlayer, ESPNTeam } from '@/lib/types/espn';

export class ESPNService {
  async syncPlayers(): Promise<void> {
    try {
      // Fetch players from ESPN
      const espnPlayers = await espnClient.getPlayers();
      const espnTeams = await espnClient.getTeams();

      // Create a map of team data
      const teamMap = new Map(espnTeams.map(team => [team.id, team]));

      // Transform and upsert players
      const players = espnPlayers.map(player => ({
        name: player.fullName,
        position: player.position,
        team: player.team,
        status: player.injuryStatus || 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Batch upsert to Supabase
      const { error } = await supabase
        .from('players')
        .upsert(players, {
          onConflict: 'name, team',
          ignoreDuplicates: false
        });

      if (error) throw error;

    } catch (error) {
      console.error('Failed to sync ESPN data:', error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string) {
    try {
      const stats = await espnClient.getPlayerStats(playerId);
      
      // Cache stats in Supabase for faster access
      await supabase
        .from('player_stats')
        .upsert({
          player_id: playerId,
          stats_data: stats,
          updated_at: new Date().toISOString()
        });

      return stats;
    } catch (error) {
      console.error('Failed to get player stats:', error);
      throw error;
    }
  }

  async getTeamSchedule(teamId: string) {
    try {
      const response = await fetch(
        `${espnClient['BASE_URL']}/teams/${teamId}/schedule`
      );
      
      if (!response.ok) {
        throw new Error(`ESPN API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get team schedule:', error);
      throw error;
    }
  }
}

export const espnService = new ESPNService();