import { NextResponse } from 'next/server';
import { aiService } from '@/lib/api/ai/service';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId');
  const gameId = searchParams.get('gameId');
  const analysisType = searchParams.get('type');

  if (!analysisType || (!playerId && !gameId)) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    let analysis;

    if (analysisType === 'player' && playerId) {
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

      analysis = await aiService.getPlayerAnalysis(player);
    } else if (analysisType === 'correlation' && gameId) {
      // Get game players
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .or(`team.eq.${gameId.split('_')[0]},team.eq.${gameId.split('_')[1]}`);

      analysis = await aiService.getCorrelationAnalysis(gameId, players || []);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}