import { NextResponse } from 'next/server';
import { socialService } from '@/lib/api/social/service';
import { supabase } from '@/lib/supabase/client';

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
    // Get player data
    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const sentiment = await socialService.getPlayerSentiment(player);
    return NextResponse.json(sentiment);
  } catch (error) {
    console.error('Social API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social data' },
      { status: 500 }
    );
  }
}