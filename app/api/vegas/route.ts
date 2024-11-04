import { NextResponse } from 'next/server';
import { vegasService } from '@/lib/api/vegas/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json(
      { error: 'Missing gameId parameter' },
      { status: 400 }
    );
  }

  try {
    const oddsData = await vegasService.getGameOdds(gameId);
    return NextResponse.json(oddsData);
  } catch (error) {
    console.error('Vegas API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch odds data' },
      { status: 500 }
    );
  }
}