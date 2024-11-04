import { NextResponse } from 'next/server';
import { syncESPNData, shouldSyncESPNData } from '@/lib/api/espn/sync';

export async function POST() {
  try {
    const needsSync = await shouldSyncESPNData();
    
    if (!needsSync) {
      return NextResponse.json({ 
        message: 'Sync not needed, last sync was less than 1 hour ago' 
      });
    }

    await syncESPNData();
    
    return NextResponse.json({ 
      message: 'ESPN data sync completed successfully' 
    });
  } catch (error) {
    console.error('ESPN sync failed:', error);
    return NextResponse.json(
      { error: 'Failed to sync ESPN data' },
      { status: 500 }
    );
  }
}