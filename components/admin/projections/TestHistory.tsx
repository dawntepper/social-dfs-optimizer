'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TestResult {
  id: string;
  timestamp: string;
  player: string;
  position: string;
  baseProjection: number;
  modifiedProjection: number;
  accuracy: number;
  factors: {
    name: string;
    impact: number;
  }[];
}

export function TestHistory() {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/admin/projections/history');
        if (!response.ok) throw new Error('Failed to fetch test history');
        const data = await response.json();
        setHistory(data.history);
      } catch (error) {
        console.error('Error fetching test history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-8 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {history.map((result) => (
          <Card key={result.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{result.player}</h3>
                      <Badge variant="outline">{result.position}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(result.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <Badge variant={result.accuracy >= 80 ? 'default' : 'secondary'}>
                    {result.accuracy}% accurate
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Base</p>
                    <p className="font-semibold">{result.baseProjection.toFixed(2)}</p>
                  </div>
                  {result.modifiedProjection > result.baseProjection ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Modified</p>
                    <p className="font-semibold">{result.modifiedProjection.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.factors.map((factor, idx) => (
                    <Badge 
                      key={idx}
                      variant={factor.impact > 0 ? 'default' : 'secondary'}
                    >
                      {factor.name}: {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}%
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}