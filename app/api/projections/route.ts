import { NextResponse } from 'next/server';
import { projectionService } from '@/lib/services/projections/ProjectionService';
import { APITracker } from '@/lib/services/monitoring/APITracker';

export async function POST(request: Request) {
  const startTime = Date.now();
  const tracker = APITracker.getInstance();

  try {
    const { players } = await request.json();

    if (!Array.isArray(players)) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected array of players.' },
        { status: 400 }
      );
    }

    // Add default values for testing if player data is minimal
    const enhancedPlayers = await projectionService.enhanceProjections(
      players.map(p => ({
        id: p.id,
        name: p.name || 'Test Player',
        position: p.position || 'QB',
        team: p.team || 'KC',
        opponent: p.opponent || 'LV',
        salary: p.salary || 8200,
        projectedPoints: p.projectedPoints || 24.5,
        ...p
      }))
    );

    // Track API usage
    await tracker.trackRequest(
      'projections',
      '/api/projections',
      200,
      Date.now() - startTime,
      0.01 * players.length // Cost per player
    );

    return NextResponse.json({
      players: enhancedPlayers,
      meta: {
        processedAt: new Date().toISOString(),
        count: players.length
      }
    });

  } catch (error) {
    console.error('Projection enhancement error:', error);

    // Track failed request
    await tracker.trackRequest(
      'projections',
      '/api/projections',
      500,
      Date.now() - startTime,
      0
    );

    return NextResponse.json(
      { error: 'Failed to enhance projections' },
      { status: 500 }
    );
  }
}