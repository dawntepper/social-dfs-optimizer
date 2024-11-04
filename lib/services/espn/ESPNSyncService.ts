import { ESPNService } from './ESPNService';
import { supabase } from '@/lib/supabase/client';
import { ESPNPlayer, ESPNTeam } from '@/lib/types/espn';
import { Player } from '@/lib/types/dfs';

export class ESPNSyncService {
  private espnService: ESPNService;
  private readonly SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.espnService = new ESPNService();
  }

  async startSync() {
    // Perform initial sync
    await this.syncData();

    // Set up interval for regular syncs
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, this.SYNC_INTERVAL);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncData() {
    try {
      // Log sync start
      await this.logSync('started');

      // Get data from ESPN
      const [players, teams] = await Promise.all([
        this.espnService.getPlayers(),
        this.espnService.getTeams()
      ]);

      // Process and store players
      await this.processPlayers(players);

      // Process and store teams
      await this.processTeams(teams);

      // Log successful sync
      await this.logSync('completed');
    } catch (error) {
      console.error('ESPN sync failed:', error);
      await this.logSync('failed', error.message);
      throw error;
    }
  }

  private async processPlayers(espnPlayers: ESPNPlayer[]) {
    const players = espnPlayers.map(this.transformPlayer);

    const { error } = await supabase
      .from('players')
      .upsert(players, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  }

  private async processTeams(espnTeams: ESPNTeam[]) {
    const { error } = await supabase
      .from('teams')
      .upsert(espnTeams, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  }

  private transformPlayer(espnPlayer: ESPNPlayer): Player {
    return {
      id: espnPlayer.id,
      name: espnPlayer.fullName,
      position: espnPlayer.defaultPositionId.toString(),
      team: espnPlayer.proTeamId.toString(),
      opponent: '', // Will be populated from schedule data
      salary: 0, // Will be populated from DK/FD data
      projectedPoints: 0, // Will be calculated
      status: espnPlayer.injured ? 'Injured' : 'Active',
      socialMetrics: {
        sentiment: 0,
        beatWriterSentiment: 0,
        trendingScore: 0,
        insights: []
      }
    };
  }

  private async logSync(status: 'started' | 'completed' | 'failed', errorMessage?: string) {
    const { error } = await supabase
      .from('sync_logs')
      .insert({
        service: 'espn',
        status,
        error_message: errorMessage,
        created_at: new Date().toISOString()
      });

    if (error) console.error('Failed to log sync:', error);
  }

  async getLastSyncStatus(): Promise<{
    lastSync: Date | null;
    status: string;
    error?: string;
  }> {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('service', 'espn')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Failed to get sync status:', error);
      return { lastSync: null, status: 'unknown' };
    }

    return {
      lastSync: data ? new Date(data.created_at) : null,
      status: data?.status || 'unknown',
      error: data?.error_message
    };
  }
}

// Export singleton instance
export const espnSyncService = new ESPNSyncService();