import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RateLimiter } from '@/lib/utils/RateLimiter';

// Create a rate limiter for OpenAI API calls - 3 requests per minute
const rateLimiter = new RateLimiter(3, 60 * 1000);

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }

    // Check rate limit before making API call
    await rateLimiter.waitForToken();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Simple API validation without making a completion request
    const models = await openai.models.list();
    
    // Check if we have access to gpt-3.5-turbo
    const hasAccess = models.data.some(model => 
      model.id === 'gpt-3.5-turbo'
    );

    if (!hasAccess) {
      throw new Error('GPT-3.5-turbo model not available with current API key');
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to OpenAI API and verified model access',
    });
  } catch (error: any) {
    console.error('OpenAI API test failed:', error);
    
    let errorMessage = error.message || 'Failed to connect to OpenAI API';
    let statusCode = error.status || 500;
    
    // Add more context for specific error cases
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your usage limits.';
      statusCode = 429;
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
      statusCode = 401;
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
      statusCode = 429;
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage
    }, { 
      status: statusCode
    });
  }
}