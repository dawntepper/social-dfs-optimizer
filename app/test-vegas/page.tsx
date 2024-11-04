'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestVegasPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testConnection = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/vegas/test');
      const data = await response.json();
      
      if (data.success) {
        setStatus('connected');
        setMessage(data.message);
      } else {
        throw new Error(data.message || 'Failed to connect to Vegas Odds API');
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
          <CardTitle>Vegas Odds API Connection Test</CardTitle>
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
              <p className="text-green-500 font-medium">✓ Connected to Vegas Odds API!</p>
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