'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Cloud, Database, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function APITestPanel() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Connection Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Database Connection</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Test connection to Supabase database
              </p>
              <Button 
                onClick={() => router.push('/test-db')}
                className="flex items-center gap-2 w-full"
              >
                <Database className="w-4 h-4" />
                Test Database Connection
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Weather API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Test connection to weather data service
              </p>
              <Button 
                onClick={() => router.push('/test-weather')}
                className="flex items-center gap-2 w-full"
              >
                <Cloud className="w-4 h-4" />
                Test Weather API Connection
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Vegas Odds API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Test connection to Vegas odds service
              </p>
              <Button 
                onClick={() => router.push('/test-vegas')}
                className="flex items-center gap-2 w-full"
              >
                <TrendingUp className="w-4 h-4" />
                Test Vegas API Connection
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">OpenAI API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Test connection to OpenAI service
              </p>
              <Button 
                onClick={() => router.push('/test-openai')}
                className="flex items-center gap-2 w-full"
              >
                <Brain className="w-4 h-4" />
                Test OpenAI API Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}