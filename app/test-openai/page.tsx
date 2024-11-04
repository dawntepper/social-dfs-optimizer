'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestOpenAIPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [retryTimer, setRetryTimer] = useState<number>(0);

  const testConnection = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/openai/test');
      const data = await response.json();
      
      if (data.success) {
        setStatus('connected');
        setMessage(data.message);
        setRetryTimer(0);
      } else {
        throw new Error(data.message || 'Failed to connect to OpenAI API');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
      
      // If it's a rate limit error, start a retry timer
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        let timeLeft = 60;
        setRetryTimer(timeLeft);
        
        const timer = setInterval(() => {
          timeLeft -= 1;
          setRetryTimer(timeLeft);
          
          if (timeLeft <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testConnection}
            disabled={status === 'loading' || retryTimer > 0}
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {status === 'loading' ? 'Testing...' : 'Test Connection'}
          </Button>

          {status === 'connected' && (
            <div className="space-y-2">
              <p className="text-green-500 font-medium">✓ Connected to OpenAI API!</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {message}
                {retryTimer > 0 && (
                  <div className="mt-2 text-sm">
                    Can retry in: {retryTimer} seconds
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}