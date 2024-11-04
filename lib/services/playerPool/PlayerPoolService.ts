import { Player } from '@/lib/types/dfs';
import { supabase } from '@/lib/supabase/client';

interface PlayerPoolRecord {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent: string;
  salary: number;
  projected_points: number;
  ownership?: number;
  slate_id: string;
  created_at: string;
  updated_at?: string;
}

export class PlayerPoolService {
  private static instance: PlayerPoolService;

  private constructor() {}

  static getInstance(): PlayerPoolService {
    if (!PlayerPoolService.instance) {
      PlayerPoolService.instance = new PlayerPoolService();
    }
    return PlayerPoolService.instance;
  }

  async createSlate(name: string, site: string, startTime: Date): Promise<{ id: string }> {
    try {
      const { data, error } = await supabase
        .from('slate')
        .insert({
          name,
          site,
          start_time: startTime.toISOString(),
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      return { id: data.id };
    } catch (error) {
      console.error('Failed to create slate:', error);
      throw error;
    }
  }

  async addPlayersToPool(players: Player[], slateId: string): Promise<void> {
    try {
      const records: PlayerPoolRecord[] = players.map(player => ({
        id: crypto.randomUUID(), // Use crypto.randomUUID() for proper UUID generation
        name: player.name,
        position: player.position,
        team: player.team,
        opponent: player.opponent,
        salary: player.salary,
        projected_points: player.projectedPoints,
        ownership: player.ownership,
        slate_id: slateId,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('player_pool')
        .insert(records);

      if (error) throw error;

      this.saveToLocalStorage('current_player_pool', players);
    } catch (error) {
      console.error('Failed to add players to pool:', error);
      throw error;
    }
  }

  async getPlayerPool(): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('player_pool')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map(record => ({
          id: record.id,
          name: record.name,
          position: record.position,
          team: record.team,
          opponent: record.opponent,
          salary: record.salary,
          projectedPoints: record.projected_points,
          ownership: record.ownership || 0,
          value: record.projected_points / (record.salary / 1000)
        }));
      }

      return this.getFromLocalStorage('current_player_pool') || [];
    } catch (error) {
      console.error('Failed to get player pool:', error);
      return this.getFromLocalStorage('current_player_pool') || [];
    }
  }

  async updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
    try {
      const record: Partial<PlayerPoolRecord> = {
        ...updates,
        projected_points: updates.projectedPoints,
        updated_at: new Date().toISOString()
      };

      delete record.projectedPoints;

      const { error } = await supabase
        .from('player_pool')
        .update(record)
        .eq('id', playerId);

      if (error) throw error;

      const players = this.getFromLocalStorage('current_player_pool') || [];
      const updatedPlayers = players.map(player => 
        player.id === playerId ? { ...player, ...updates } : player
      );
      this.saveToLocalStorage('current_player_pool', updatedPlayers);
    } catch (error) {
      console.error('Failed to update player:', error);
      throw error;
    }
  }

  async deletePlayer(playerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('player_pool')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      const players = this.getFromLocalStorage('current_player_pool') || [];
      const updatedPlayers = players.filter(player => player.id !== playerId);
      this.saveToLocalStorage('current_player_pool', updatedPlayers);
    } catch (error) {
      console.error('Failed to delete player:', error);
      throw error;
    }
  }

  async clearPlayerPool(): Promise<void> {
    try {
      const { error } = await supabase
        .from('player_pool')
        .delete()
        .neq('id', '0');

      if (error) throw error;

      localStorage.removeItem('current_player_pool');
    } catch (error) {
      console.error('Failed to clear player pool:', error);
      throw error;
    }
  }

  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private getFromLocalStorage(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return null;
    }
  }
}

export const playerPoolService = PlayerPoolService.getInstance();