import { NextResponse } from 'next/server';
import { espnService } from '@/lib/api/espn/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json(
      { error: 'Missing teamId parameter' },
      { status: 400 }
    );
  }

  try {
    const correlations = await espnService.getTeamCorrelations(teamId);
    return NextResponse.json(correlations);
  } catch (error) {
    console.error('ESPN API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team correlations' },
      { status: 500 }
    );
  }
}