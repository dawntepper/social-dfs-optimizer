import { espnService } from './service';
import { supabase } from '@/lib/supabase/client';

export async function syncESPNData() {
  try {
    // Start sync
    await supabase
      .from('sync_logs')
      .insert({
        service: 'espn',
        status: 'started',
        started_at: new Date().toISOString()
      });

    // Sync players and teams
    await espnService.syncPlayers();

    // Update sync status
    await supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('service', 'espn')
      .is('completed_at', null);

  } catch (error) {
    // Log sync error
    await supabase
      .from('sync_logs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('service', 'espn')
      .is('completed_at', null);

    throw error;
  }
}

// Function to check if sync is needed
export async function shouldSyncESPNData(): Promise<boolean> {
  const { data: lastSync } = await supabase
    .from('sync_logs')
    .select('completed_at')
    .eq('service', 'espn')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (!lastSync) return true;

  const lastSyncTime = new Date(lastSync.completed_at).getTime();
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  return lastSyncTime < oneHourAgo;
}