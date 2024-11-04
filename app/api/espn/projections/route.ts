import { NextResponse } from 'next/server';
import { espnService } from '@/lib/api/espn/service';

export async function POST(request: Request) {
  try {
    const { stats } = await request.json();

    if (!stats) {
      return NextResponse.json(
        { error: 'Missing stats data' },
        { status: 400 }
      );
    }

    // Calculate projections based on historical stats
    const projections = await espnService.calculateProjections(stats);
    return NextResponse.json(projections);
  } catch (error) {
    console.error('ESPN API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate projections' },
      { status: 500 }
    );
  }
}