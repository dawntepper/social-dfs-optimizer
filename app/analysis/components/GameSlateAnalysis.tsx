'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { slateService } from '@/lib/services/dfs/SlateDataService';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { InjuryList } from '@/components/injuries/InjuryList';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface GameSlateAnalysisProps {
  selectedTeam: string;
  onTeamChange: (team: string) => void;
}

export default function GameSlateAnalysis({ selectedTeam, onTeamChange }: GameSlateAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any>(null);

  useEffect(() => {
    const loadTeamData = async () => {
      setLoading(true);
      try {
        const data = slateService.getTeamData(selectedTeam);
        setTeamData(data);
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedTeam) {
      loadTeamData();
    }
  }, [selectedTeam]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Game Analysis</CardTitle>
          <Select 
            value={selectedTeam} 
            onValueChange={onTeamChange}
          >
            <SelectTrigger 
              className="w-[200px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {slateService.getAllTeams().map(team => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {teamData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{teamData.time}</span>
              </div>
              <Badge variant="outline">
                {teamData.name} vs {teamData.opponent}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Game Total</p>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <span className="text-xl font-bold">{teamData.total}</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total points expected in this game</p>
                    <p className="text-sm text-muted-foreground">
                      Trending up: High-scoring game expected
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Spread</p>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <span className="text-xl font-bold">{teamData.spread}</span>
                    {teamData.spread < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{teamData.spread < 0 ? 'Favored by' : 'Underdog by'} {Math.abs(teamData.spread)} points</p>
                    <p className="text-sm text-muted-foreground">
                      {teamData.spread < 0 
                        ? 'Team expected to win by this margin'
                        : 'Team expected to lose by this margin'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Team Injuries</h3>
              <InjuryList team={selectedTeam} minimal />
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Select a team to view game analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
}