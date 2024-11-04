import { NextResponse } from 'next/server';
import { vegasClient } from '@/lib/api/vegas/client';

export async function GET() {
  try {
    const result = await vegasClient.testConnection();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Vegas API test failed:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to connect to Vegas Odds API'
    }, { status: 500 });
  }
}