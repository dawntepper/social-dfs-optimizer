import { NextResponse } from 'next/server';
import { APITracker } from '@/lib/services/monitoring/APITracker';

export async function GET() {
  try {
    const tracker = APITracker.getInstance();
    const stats = await tracker.getCurrentUsage();
    
    if (!stats) {
      return NextResponse.json({
        openai: { count: 0, cost: 0, limit: 100 },
        weather: { count: 0, cost: 0, limit: 1000 },
        vegas: { count: 0, cost: 0, limit: 500 }
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get current API usage:', error);
    return NextResponse.json(
      {
        openai: { count: 0, cost: 0, limit: 100 },
        weather: { count: 0, cost: 0, limit: 1000 },
        vegas: { count: 0, cost: 0, limit: 500 }
      },
      { status: 200 } // Return default data even on error
    );
  }
}