'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { lineupExporter } from '@/lib/services/lineups/LineupExporter';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LineupBuilderProps {
  lineups?: any[];
  loading?: boolean;
  error?: string | null;
}

export default function LineupBuilder({ 
  lineups = [], 
  loading = false, 
  error = null 
}: LineupBuilderProps) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (lineups.length > 0) {
      // Store lineups in localStorage for analysis page
      localStorage.setItem('generatedLineups', JSON.stringify(lineups));
    }
  }, [lineups]);

  const handleExport = async () => {
    try {
      const csvContent = lineupExporter.exportToCSV(lineups);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lineups.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Exported ${lineups.length} lineups to CSV`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export lineups',
        variant: 'destructive',
      });
    }
  };

  const handleAnalyze = () => {
    router.push('/analyze-lineups');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">Generating lineups...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lineups.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No lineups generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Generated Lineups</h2>
        <div className="flex gap-2">
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleAnalyze} variant="default">
            <ExternalLink className="w-4 h-4 mr-2" />
            Analyze Lineups
          </Button>
        </div>
      </div>

      {lineups.slice(0, 5).map((lineup, index) => (
        <Card key={index} className={cn(
          'border',
          index % 2 === 0 ? 'bg-muted/30' : 'bg-background'
        )}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Lineup {index + 1}</h3>
                  <Badge variant="outline">
                    Score: {lineup.projectedPoints?.toFixed(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>${lineup.totalSalary?.toLocaleString()}</span>
                  <span>{lineup.totalOwnership?.toFixed(1)}% owned</span>
                  {lineup.stacks?.length > 0 && (
                    <span>
                      {lineup.stacks[0].positions.join('+')} Stack
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lineup.projectedPoints > lineup.averageProjection ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
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
                      <span className="text-sm text-muted-foreground">
                        {player.team}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {player.ownership?.toFixed(1)}% owned
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {player.projectedPoints?.toFixed(1)} pts
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${player.salary?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {lineup.stacks?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Stack Analysis:</span>
                  <span>{(lineup.stacks[0].correlation * 100).toFixed(0)}% correlation</span>
                  <span>•</span>
                  <span>{lineup.stacks[0].projectedPoints.toFixed(1)} projected pts</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {lineups.length > 5 && (
        <div className="text-center">
          <Button variant="link" onClick={handleAnalyze}>
            View all {lineups.length} lineups in the Analyzer
          </Button>
        </div>
      )}
    </div>
  );
}