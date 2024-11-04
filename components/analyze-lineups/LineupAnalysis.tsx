'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LineupAnalysisProps {
  lineups: any[];
  analysis: any;
}

export function LineupAnalysis({ lineups, analysis }: LineupAnalysisProps) {
  const [sortedLineups, setSortedLineups] = useState<any[]>([]);

  useEffect(() => {
    if (lineups?.length > 0) {
      const sorted = [...lineups].sort((a, b) => b.score - a.score);
      setSortedLineups(sorted);
    }
  }, [lineups]);

  if (!lineups?.length) return null;

  return (
    <div className="space-y-4">
      {sortedLineups.map((lineup, i) => {
        const contestNames = lineup.contestNames || ['Unknown Contest'];
        
        return (
          <Card 
            key={i}
            className={cn(
              'border',
              i % 2 === 0 ? 'bg-muted/30' : 'bg-background'
            )}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Lineup {i + 1}</h3>
                    <span className="text-muted-foreground">
                      {contestNames.join(' | ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Score: {lineup.score}</span>
                    <span>Total Salary: ${lineup.totalSalary?.toLocaleString()}</span>
                    <span>Avg Ownership: {lineup.totalOwnership?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {lineup.players?.map((player: any, j: number) => (
                  <div 
                    key={j}
                    className={cn(
                      "p-2 rounded-lg",
                      j % 2 === 0 ? 'bg-muted/50' : 'bg-background'
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{player.position}</Badge>
                        <span>{player.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {player.ownership?.toFixed(1)}% owned
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {player.projection?.toFixed(1)} pts
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ${player.salary?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}