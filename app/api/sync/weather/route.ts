import { NextResponse } from 'next/server';
import { weatherSyncService } from '@/lib/services/weather/WeatherSyncService';

export async function POST() {
  try {
    await weatherSyncService.startSync();
    return NextResponse.json({ message: 'Weather sync initiated successfully' });
  } catch (error) {
    console.error('Weather sync failed:', error);
    return NextResponse.json(
      { error: 'Failed to sync weather data' },
      { status: 500 }
    );
  }
}