'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LineupDisplayProps {
  lineup: any;
  type: 'mid-size' | 'large-field';
  onExport: () => void;
}

export function LineupDisplay({ lineup, type, onExport }: LineupDisplayProps) {
  const getOwnershipColor = (ownership: number) => {
    if (type === 'mid-size') {
      if (ownership > 25) return 'text-red-500';
      if (ownership > 15) return 'text-yellow-500';
      return 'text-green-500';
    } else {
      if (ownership > 15) return 'text-red-500';
      if (ownership > 8) return 'text-yellow-500';
      return 'text-green-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {type === 'mid-size' ? 'Mid-Size GPP Lineup' : 'Large-Field GPP Lineup'}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Lineup Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Salary</p>
              <p className="text-lg font-semibold">${lineup.totalSalary.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projected Points</p>
              <p className="text-lg font-semibold">{lineup.projectedPoints.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ownership</p>
              <p className={cn("text-lg font-semibold", getOwnershipColor(lineup.totalOwnership))}>
                {lineup.totalOwnership.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Players */}
          <div className="space-y-2">
            {lineup.players.map((player: any) => (
              <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{player.position}</Badge>
                  <span>{player.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>${player.salary.toLocaleString()}</span>
                  <span>{player.projectedPoints.toFixed(1)} pts</span>
                  <span className={getOwnershipColor(player.ownership)}>
                    {player.ownership.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}