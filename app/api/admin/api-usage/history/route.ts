import { NextResponse } from 'next/server';
import { APITracker } from '@/lib/services/monitoring/APITracker';

export async function GET() {
  try {
    const tracker = APITracker.getInstance();
    const stats = await tracker.getUsageStats();
    
    if (!stats || !Array.isArray(stats)) {
      return NextResponse.json([]);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get API usage history:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}