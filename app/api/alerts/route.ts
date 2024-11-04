import { NextResponse } from 'next/server';
import { ProjectionAlertService } from '@/lib/services/alerts/ProjectionAlertService';

// Mock data for development
const mockAlerts = [
  {
    id: 1,
    playerName: "Patrick Mahomes",
    oldProjection: 22.5,
    newProjection: 24.8,
    percentageChange: 0.102,
    severity: "HIGH",
    reason: "Strong positive social sentiment; favorable weather forecast",
    timestamp: Date.now() - 1800000, // 30 minutes ago
    relatedPosts: [
      {
        id: "t1",
        platform: "twitter",
        author: "NFL Insider",
        content: "Mahomes looking sharp in practice. Weather conditions ideal for passing game.",
        sentiment: 0.8,
        timestamp: "30m ago",
        verified: true,
        engagement: 1250
      },
      {
        id: "r1",
        platform: "reddit",
        author: "ChiefsAnalyst",
        content: "Film study shows Raiders secondary struggling against deep passes. Mahomes could have a big day.",
        sentiment: 0.6,
        timestamp: "45m ago",
        verified: false,
        engagement: 890
      }
    ],
    aiSummary: "Multiple factors point to increased projection: strong practice performance, favorable weather conditions, and exploitable matchup against Raiders secondary. Beat writer sentiment particularly positive regarding deep passing opportunities."
  },
  {
    id: 2,
    playerName: "Christian McCaffrey",
    oldProjection: 20.1,
    newProjection: 17.8,
    percentageChange: -0.114,
    severity: "CRITICAL",
    reason: "Limited in practice; concerning beat writer reports",
    timestamp: Date.now() - 3600000, // 1 hour ago
    relatedPosts: [
      {
        id: "t2",
        platform: "twitter",
        author: "49ers Beat",
        content: "CMC limited in practice again. Rotation with backup RBs noticed during team drills.",
        sentiment: -0.6,
        timestamp: "1h ago",
        verified: true,
        engagement: 2100
      }
    ],
    aiSummary: "Practice limitations and increased rotation with backup RBs suggest potential workload management. While still expected to start, snap count could be monitored more closely than usual."
  }
];

const alertService = new ProjectionAlertService();

export async function GET() {
  try {
    // For development, return mock data
    // In production, this would be: const alerts = await alertService.getRecentAlerts();
    return NextResponse.json(mockAlerts);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const alert = await alertService.checkProjectionChange(
      data.player,
      data.oldProjection,
      data.newProjection,
      data.socialMetrics
    );
    
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Failed to create alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}