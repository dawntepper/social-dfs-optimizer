import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock impact analysis data for testing
    const factors = [
      {
        name: 'Weather Impact',
        impact: 2.5,
        confidence: 0.85,
        description: 'Clear conditions with moderate temperatures have shown positive correlation with passing game efficiency',
        icon: 'weather'
      },
      {
        name: 'Vegas Lines',
        impact: 3.8,
        confidence: 0.92,
        description: 'High team total and favorable game script suggest increased scoring opportunities',
        icon: 'vegas'
      },
      {
        name: 'Social Sentiment',
        impact: -1.2,
        confidence: 0.78,
        description: 'Mixed signals from beat writers and recent social media trends indicate some uncertainty',
        icon: 'social'
      }
    ];

    return NextResponse.json({ factors });
  } catch (error) {
    console.error('Failed to fetch impact analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch impact analysis' },
      { status: 500 }
    );
  }
}