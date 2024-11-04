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
    const schedule = await espnService.getTeamSchedule(teamId);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('ESPN API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team schedule' },
      { status: 500 }
    );
  }
}