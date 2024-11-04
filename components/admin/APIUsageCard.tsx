'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface APIUsageCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  limit: number;
  cost: number;
  loading: boolean;
}

export function APIUsageCard({ 
  title, 
  icon: Icon, 
  count = 0, 
  limit = 0, 
  cost = 0, 
  loading = false 
}: APIUsageCardProps) {
  const usagePercentage = limit > 0 ? (count / limit) * 100 : 0;
  const isHighUsage = usagePercentage > 80;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Requests Today</span>
              <Badge variant={isHighUsage ? 'destructive' : 'default'}>
                {count.toLocaleString()} / {limit.toLocaleString()}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Cost</span>
              <span>${cost.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}