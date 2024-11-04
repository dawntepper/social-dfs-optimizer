'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, TrendingDown, Cloud, Users } from 'lucide-react';

interface ProjectionResult {
  baseProjection: number;
  modifiedProjection: number;
  factors: {
    name: string;
    impact: number;
    confidence: number;
  }[];
}

export default function TestProjectionsPage() {
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProjectionResult | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    if (!playerId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a player ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/projections/test?playerId=${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch projection');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test projection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Test Projections</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter player ID"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleTest} disabled={loading}>
              {loading ? 'Testing...' : 'Test Projection'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">Base Projection</p>
                  <p className="text-2xl font-bold">{result.baseProjection.toFixed(2)}</p>
                </div>
                {result.modifiedProjection > result.baseProjection ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Modified Projection</p>
                  <p className="text-2xl font-bold">{result.modifiedProjection.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Impact Factors</h3>
                {result.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      {factor.name === 'Weather' && <Cloud className="w-4 h-4" />}
                      {factor.name === 'Vegas' && <TrendingUp className="w-4 h-4" />}
                      {factor.name === 'Social' && <Users className="w-4 h-4" />}
                      <span>{factor.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={factor.impact > 0 ? 'default' : 'secondary'}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {(factor.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}