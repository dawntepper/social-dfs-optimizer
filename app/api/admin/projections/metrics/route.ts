import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock metrics data for testing
    const metrics = {
      positions: {
        QB: {
          accuracy: 85.2,
          errorRate: 14.8,
          sampleSize: 124,
          history: generateHistoryData()
        },
        RB: {
          accuracy: 82.7,
          errorRate: 17.3,
          sampleSize: 156,
          history: generateHistoryData()
        },
        WR: {
          accuracy: 78.4,
          errorRate: 21.6,
          sampleSize: 198,
          history: generateHistoryData()
        },
        TE: {
          accuracy: 76.9,
          errorRate: 23.1,
          sampleSize: 92,
          history: generateHistoryData()
        }
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch projection metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

function generateHistoryData() {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toISOString(),
      accuracy: 70 + Math.random() * 20
    });
  }

  return data;
}