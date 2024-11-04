'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

// Mock data
const mockPlayers = [
  {
    id: '1',
    name: 'Patrick Mahomes',
    team: 'KC',
    position: 'QB',
    sentiment: 0.8,
    trendDirection: 'up',
    status: 'ACTIVE',
    lastUpdate: '10 minutes ago',
    nextUpdate: '2024-01-21T16:00:00',
    beatWriterSentiment: 0.9,
    socialVolume: 2500
  },
  {
    id: '2',
    name: 'Christian McCaffrey',
    team: 'SF',
    position: 'RB',
    sentiment: -0.3,
    trendDirection: 'down',
    status: 'QUESTIONABLE',
    lastUpdate: '1 hour ago',
    nextUpdate: '2024-01-21T11:30:00',
    beatWriterSentiment: -0.4,
    socialVolume: 1800
  },
  {
    id: '3',
    name: 'Tyreek Hill',
    team: 'MIA',
    position: 'WR',
    sentiment: 0.6,
    trendDirection: 'up',
    status: 'ACTIVE',
    lastUpdate: '30 minutes ago',
    nextUpdate: '2024-01-21T16:00:00',
    beatWriterSentiment: 0.7,
    socialVolume: 2100
  },
  {
    id: '4',
    name: 'Travis Kelce',
    team: 'KC',
    position: 'TE',
    sentiment: 0.4,
    trendDirection: 'neutral',
    status: 'ACTIVE',
    lastUpdate: '15 minutes ago',
    nextUpdate: '2024-01-21T16:00:00',
    beatWriterSentiment: 0.5,
    socialVolume: 1900
  },
  {
    id: '5',
    name: 'Deebo Samuel',
    team: 'SF',
    position: 'WR',
    sentiment: -0.2,
    trendDirection: 'down',
    status: 'DOUBTFUL',
    lastUpdate: '45 minutes ago',
    nextUpdate: '2024-01-21T11:30:00',
    beatWriterSentiment: -0.6,
    socialVolume: 1600
  }
];

export function SentimentMonitor() {
  const [players, setPlayers] = useState(mockPlayers);

  // Status colors
  const statusColors = {
    ACTIVE: 'bg-green-500',
    QUESTIONABLE: 'bg-yellow-500',
    DOUBTFUL: 'bg-orange-500',
    OUT: 'bg-red-500'
  };

  // Convert sentiment (-1 to 1) to progress (0 to 100)
  const sentimentToProgress = (sentiment: number): number => {
    return (sentiment + 1) * 50; // Convert -1:1 to 0:100
  };

  const getStatusBadge = (status: string, nextUpdate: string) => {
    const now = new Date();
    const update = new Date(nextUpdate);
    const hoursUntilUpdate = (update.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      <div className="flex items-center gap-2">
        <Badge variant={status === 'ACTIVE' ? 'default' : 'destructive'}>
          {status}
        </Badge>
        {hoursUntilUpdate < 24 && status !== 'ACTIVE' && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {hoursUntilUpdate < 1 
              ? 'Update imminent'
              : `Update in ${Math.floor(hoursUntilUpdate)}h`}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Live Sentiment Monitor</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Practice Report: Thu/Fri 4pm ET
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Game Status: Sun 11:30am ET
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {players.map((player) => (
              <div key={player.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{player.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {player.position} · {player.team}
                      </span>
                    </div>
                    {getStatusBadge(player.status, player.nextUpdate)}
                  </div>
                  <div className="flex items-center gap-2">
                    {player.trendDirection === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : player.trendDirection === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <Badge variant="secondary">
                      Volume: {player.socialVolume.toLocaleString()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-24">Social</span>
                    <Progress 
                      value={sentimentToProgress(player.sentiment)} 
                      className="h-2"
                    />
                    <span className="text-sm w-12 text-right">
                      {(player.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-24">Beat Writers</span>
                    <Progress 
                      value={sentimentToProgress(player.beatWriterSentiment)} 
                      className="h-2"
                    />
                    <span className="text-sm w-12 text-right">
                      {(player.beatWriterSentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  Last update: {player.lastUpdate}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}