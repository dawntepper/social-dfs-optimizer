import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TestRequest {
  player: string;
  position: string;
  baseProjection: number;
}

interface ProjectionResult {
  baseProjection: number;
  modifiedProjection: number;
  modifiers: {
    weather: number;
    vegas: number;
    social: number;
  };
  insights: string[];
  confidence: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.player || !body.position || typeof body.baseProjection !== 'number') {
      return NextResponse.json(
        { 
          error: 'Missing or invalid required fields',
          required: ['player', 'position', 'baseProjection'],
          received: body 
        },
        { status: 400 }
      );
    }

    const testRequest = body as TestRequest;
    const validPositions = ['QB', 'RB', 'WR', 'TE'];
    
    if (!validPositions.includes(testRequest.position)) {
      return NextResponse.json(
        { error: 'Invalid position', valid: validPositions },
        { status: 400 }
      );
    }

    // Generate deterministic modifiers based on player name and position
    const seed = testRequest.player.length + testRequest.position.length;
    const weatherImpact = 1 + (Math.sin(seed) * 0.02);
    const vegasImpact = 1 + (Math.cos(seed) * 0.02);
    const socialImpact = 1 + (Math.tan(seed) * 0.02);

    const modifiedProjection = testRequest.baseProjection * weatherImpact * vegasImpact * socialImpact;

    const result: ProjectionResult = {
      baseProjection: Number(testRequest.baseProjection.toFixed(2)),
      modifiedProjection: Number(modifiedProjection.toFixed(2)),
      modifiers: {
        weather: Number(weatherImpact.toFixed(4)),
        vegas: Number(vegasImpact.toFixed(4)),
        social: Number(socialImpact.toFixed(4))
      },
      insights: getPositionInsights(testRequest.position),
      confidence: 0.85
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Projection test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getPositionInsights(position: string): string[] {
  const baseInsights = [
    'Weather conditions are favorable for performance',
    'Vegas lines indicate positive game script'
  ];

  const positionInsights: Record<string, string[]> = {
    'QB': [
      'Strong correlation with primary receivers',
      'Pass-heavy game script expected',
      'Protection metrics trending positively'
    ],
    'RB': [
      'Positive game script for rushing volume',
      'High red zone opportunity share',
      'Strong offensive line metrics'
    ],
    'WR': [
      'High target share projection',
      'Favorable cornerback matchup',
      'Deep ball opportunities trending up'
    ],
    'TE': [
      'Consistent red zone usage',
      'High snap count in passing downs',
      'Favorable linebacker matchup'
    ]
  };

  return [...baseInsights, ...positionInsights[position]];
}