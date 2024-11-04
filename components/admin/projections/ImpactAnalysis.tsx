'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cloud, TrendingUp, Users } from 'lucide-react';

interface ImpactFactor {
  name: string;
  impact: number;
  confidence: number;
  description: string;
  icon: any;
}

export function ImpactAnalysis() {
  const [factors, setFactors] = useState<ImpactFactor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const response = await fetch('/api/admin/projections/impact');
        if (!response.ok) throw new Error('Failed to fetch impact data');
        const data = await response.json();
        setFactors(data.factors);
      } catch (error) {
        console.error('Error fetching impact data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
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
    <div className="space-y-4">
      {factors.map((factor, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {factor.icon === 'weather' && <Cloud className="w-5 h-5" />}
                  {factor.icon === 'vegas' && <TrendingUp className="w-5 h-5" />}
                  {factor.icon === 'social' && <Users className="w-5 h-5" />}
                  <h3 className="font-semibold">{factor.name}</h3>
                </div>
                <Badge variant={factor.impact > 0 ? 'default' : 'secondary'}>
                  {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}%
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence</span>
                  <span>{(factor.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={factor.confidence * 100} />
              </div>

              <p className="text-sm text-muted-foreground">
                {factor.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}