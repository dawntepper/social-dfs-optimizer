'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestTwitterPage() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch('/api/twitter/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.success) {
          setStatus('connected');
          setMessage(data.message);
        } else {
          throw new Error(data.message || 'Failed to connect to Twitter API');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Twitter API Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <p className="text-muted-foreground">Testing Twitter API connection...</p>
          )}
          {status === 'connected' && (
            <div className="space-y-2">
              <p className="text-green-500 font-medium">✓ Connected to Twitter API!</p>
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