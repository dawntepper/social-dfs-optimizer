'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Cloud, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LineupAnalysisProps {
  lineups: any[];
  analysis: {
    score: number;
    insights: string[];
    recommendations: string[];
  } | null;
}

export function LineupAnalysis({ lineups, analysis }: LineupAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!lineups?.length) return null;

  const getOwnershipDistribution = () => {
    const ownershipData = lineups.map(lineup => ({
      totalOwnership: lineup.totalOwnership,
      count: 1
    }));

    // Group by ownership ranges
    const distribution = ownershipData.reduce((acc, curr) => {
      const range = Math.floor(curr.totalOwnership / 5) * 5;
      const key = `${range}-${range + 5}%`;
      acc[key] = (acc[key] || 0) + curr.count;
      return acc;
    }, {});

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count
    }));
  };

  const getExposureLevels = () => {
    const playerExposure = new Map();
    
    lineups.forEach(lineup => {
      lineup.players.forEach(player => {
        const current = playerExposure.get(player.name) || 0;
        playerExposure.set(player.name, current + 1);
      });
    });

    return Array.from(playerExposure.entries())
      .map(([name, count]) => ({
        name,
        exposure: (count / lineups.length) * 100
      }))
      .sort((a, b) => b.exposure - a.exposure);
  };

  const getStackDistribution = () => {
    return lineups.map(lineup => ({
      correlationScore: lineup.stacks?.[0]?.correlation || 0,
      stackSize: lineup.stacks?.[0]?.positions.length || 0
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ownership">Ownership</TabsTrigger>
              <TabsTrigger value="stacks">Stacks</TabsTrigger>
              <TabsTrigger value="exposure">Exposure</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{analysis?.score || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Lineups</p>
                  <p className="text-2xl font-bold">{lineups.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Ownership</p>
                  <p className="text-2xl font-bold">
                    {(lineups.reduce((sum, l) => sum + l.totalOwnership, 0) / lineups.length).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Key Insights</h4>
                <ul className="space-y-1">
                  {analysis?.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <ul className="space-y-1">
                  {analysis?.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="ownership">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getOwnershipDistribution()}>
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      name="Lineups" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="stacks">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getStackDistribution()}>
                    <XAxis dataKey="stackSize" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="correlationScore" 
                      stroke="hsl(var(--primary))" 
                      name="Correlation" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="exposure">
              <div className="space-y-2">
                {getExposureLevels().slice(0, 10).map((player, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{player.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${player.exposure}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {player.exposure.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {lineups.map((lineup, i) => (
          <Card key={i} className={cn(
            'border',
            i % 2 === 0 ? 'bg-muted/30' : 'bg-background'
          )}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Lineup {i + 1}</h3>
                    <Badge variant="outline">
                      Score: {Math.round(lineup.projectedPoints)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>
                      <DollarSign className="w-4 h-4 inline-block" />
                      {lineup.totalSalary?.toLocaleString()}
                    </span>
                    <span>
                      <Users className="w-4 h-4 inline-block" />
                      {lineup.totalOwnership?.toFixed(1)}% owned
                    </span>
                    {lineup.stacks?.[0] && (
                      <span>
                        <TrendingUp className="w-4 h-4 inline-block" />
                        {(lineup.stacks[0].correlation * 100).toFixed(0)}% correlation
                      </span>
                    )}
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
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Stack Analysis</h4>
                  <div className="space-y-2">
                    {lineup.stacks.map((stack, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {stack.positions.join('+')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {(stack.correlation * 100).toFixed(0)}% correlation
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}