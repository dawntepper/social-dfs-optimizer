import { NextResponse } from 'next/server';
import { espnService } from '@/lib/api/espn/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId');

  if (!playerId) {
    return NextResponse.json(
      { error: 'Missing playerId parameter' },
      { status: 400 }
    );
  }

  try {
    const stats = await espnService.getPlayerStats(playerId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('ESPN API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player stats' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await espnService.syncPlayers();
    return NextResponse.json({ message: 'ESPN data sync completed successfully' });
  } catch (error) {
    console.error('ESPN sync failed:', error);
    return NextResponse.json(
      { error: 'Failed to sync ESPN data' },
      { status: 500 }
    );
  }
}