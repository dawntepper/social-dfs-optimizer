'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestWeatherPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testConnection = async () => {
    try {
      setStatus('loading');
      // Test with Kansas City's coordinates (Arrowhead Stadium)
      const response = await fetch('/api/weather/test');
      const data = await response.json();
      
      if (data.success) {
        setStatus('connected');
        setMessage(data.message);
      } else {
        throw new Error(data.message || 'Failed to connect to Weather API');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Weather API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testConnection}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Testing...' : 'Test Connection'}
          </Button>

          {status === 'connected' && (
            <div className="space-y-2">
              <p className="text-green-500 font-medium">✓ Connected to Weather API!</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-2">
              <p className="text-red-500 font-medium">Connection error:</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}