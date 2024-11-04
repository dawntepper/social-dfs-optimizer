import { NextResponse } from 'next/server';
import { weatherClient } from '@/lib/api/weather/client';

export async function GET() {
  try {
    // Test with Kansas City's coordinates (Arrowhead Stadium)
    const weatherData = await weatherClient.getGameWeather('KC');
    
    return NextResponse.json({
      success: true,
      message: `Successfully connected to Weather API. Current temperature: ${weatherData.temperature}°F, Wind: ${weatherData.windSpeed} mph`,
      data: weatherData
    });
  } catch (error: any) {
    console.error('Weather API test failed:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to connect to Weather API'
    }, { status: 500 });
  }
}