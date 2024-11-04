import { NextResponse } from 'next/server';
import { espnSyncService } from '@/lib/services/espn/ESPNSyncService';

export async function GET() {
  try {
    const status = await espnSyncService.getLastSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to get ESPN sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}