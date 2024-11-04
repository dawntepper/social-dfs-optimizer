'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const playerData = {
  'KC': {
    'Patrick Mahomes': {
      position: 'QB',
      lastFiveGames: [
        { week: 'Week 13', points: 28.5 },
        { week: 'Week 14', points: 22.3 },
        { week: 'Week 15', points: 31.2 },
        { week: 'Week 16', points: 25.8 },
        { week: 'Week 17', points: 29.4 },
      ],
      insights: [
        'Averaging 27.4 points in last 5 games',
        'Strong correlation with Kelce (0.72)',
        'Home/road split favors home games (+3.2 pts)',
      ],
      teammates: [
        { name: 'Travis Kelce', position: 'TE', correlation: 0.72 },
        { name: 'Rashee Rice', position: 'WR', correlation: 0.65 },
        { name: 'Isiah Pacheco', position: 'RB', correlation: 0.45 },
      ]
    },
    'Travis Kelce': {
      position: 'TE',
      lastFiveGames: [
        { week: 'Week 13', points: 18.2 },
        { week: 'Week 14', points: 16.4 },
        { week: 'Week 15', points: 21.3 },
        { week: 'Week 16', points: 17.8 },
        { week: 'Week 17', points: 19.6 },
      ],
      insights: [
        'Consistent red zone target share (28%)',
        'High correlation with Mahomes',
        'Increased snap count last 3 weeks',
      ],
      teammates: [
        { name: 'Patrick Mahomes', position: 'QB', correlation: 0.72 },
        { name: 'Rashee Rice', position: 'WR', correlation: 0.45 },
        { name: 'Isiah Pacheco', position: 'RB', correlation: 0.35 },
      ]
    },
    // Add more KC players...
  },
  // Add more teams...
};

export default function PlayerInsights() {
  const [selectedTeam, setSelectedTeam] = useState('KC');
  const [selectedPlayer, setSelectedPlayer] = useState('Patrick Mahomes');

  const player = playerData[selectedTeam]?.[selectedPlayer];

  const getCorrelationColor = (correlation: number) => {
    if (correlation >= 0.7) return 'text-green-500';
    if (correlation >= 0.5) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  if (!player) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(playerData).map(team => (
              <SelectItem key={team} value={team}>{team}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(playerData[selectedTeam] || {}).map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h4 className="font-semibold text-lg">{selectedPlayer}</h4>
            <p className="text-sm text-muted-foreground">{player.position}</p>
          </div>

          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={player.lastFiveGames}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Performance Insights</h5>
              <div className="space-y-2">
                {player.insights.map((insight, idx) => (
                  <p key={idx} className="text-sm">
                    • {insight}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Teammate Correlations</h5>
              <div className="space-y-2">
                {player.teammates.map((teammate, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => setSelectedPlayer(teammate.name)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{teammate.position}</Badge>
                      <span className="text-sm">{teammate.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${getCorrelationColor(teammate.correlation)}`}>
                      {(teammate.correlation * 100).toFixed(0)}% correlation
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}