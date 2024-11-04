import { NextResponse } from 'next/server';
import { weatherSyncService } from '@/lib/services/weather/WeatherSyncService';

export async function GET() {
  try {
    const status = await weatherSyncService.getLastSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to get weather sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}