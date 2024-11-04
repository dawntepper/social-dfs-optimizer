import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function GET() {
  try {
    if (!process.env.TWITTER_API_KEY) throw new Error('Missing TWITTER_API_KEY');
    if (!process.env.TWITTER_API_SECRET) throw new Error('Missing TWITTER_API_SECRET');
    if (!process.env.TWITTER_ACCESS_TOKEN) throw new Error('Missing TWITTER_ACCESS_TOKEN');
    if (!process.env.TWITTER_ACCESS_SECRET) throw new Error('Missing TWITTER_ACCESS_SECRET');

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    // Test the connection by getting user context
    const user = await client.v2.me();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Twitter API',
      user
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error: any) {
    console.error('Twitter API test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to connect to Twitter API'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}