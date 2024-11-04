'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  CloudRain,
  Wind,
  Zap,
  ChevronDown,
  ChevronUp,
  Plus,
  Info
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const gameStacks = [
  {
    id: 'kc-1',
    game: 'KC vs LV',
    totalSalary: 32500,
    projectedPoints: 156.5,
    ownership: 25.5,
    correlation: 0.85,
    weatherImpact: 'neutral',
    stackType: 'primary',
    players: [
      { name: 'P.Mahomes', position: 'QB', salary: 8200, ownership: 15.2, projection: 24.5 },
      { name: 'T.Kelce', position: 'TE', salary: 7800, ownership: 18.5, projection: 18.2 },
      { name: 'R.Rice', position: 'WR', salary: 5900, ownership: 8.4, projection: 14.2 },
      { name: 'D.Adams', position: 'WR', salary: 7400, ownership: 12.8, projection: 19.8 }
    ],
    insights: [
      'High correlation between Mahomes and Kelce (0.82)',
      'Raiders allowing 278 passing yards per game',
      'Weather conditions favorable for passing'
    ]
  },
  {
    id: 'buf-1',
    game: 'BUF vs MIA',
    totalSalary: 31800,
    projectedPoints: 148.2,
    ownership: 18.2,
    correlation: 0.78,
    weatherImpact: 'positive',
    stackType: 'contrarian',
    players: [
      { name: 'J.Allen', position: 'QB', salary: 8000, ownership: 12.5, projection: 26.2 },
      { name: 'S.Diggs', position: 'WR', salary: 8300, ownership: 14.2, projection: 21.5 },
      { name: 'G.Davis', position: 'WR', salary: 5800, ownership: 6.8, projection: 13.8 },
      { name: 'D.Kincaid', position: 'TE', salary: 5200, ownership: 4.8, projection: 11.2 }
    ],
    insights: [
      'Strong correlation in Bills passing game',
      'High total in dome environment',
      'Low combined ownership provides leverage'
    ]
  }
];

export default function GameStacks() {
  const [expandedStacks, setExpandedStacks] = useState<string[]>(['kc-1']); // Primary stack expanded by default

  const toggleStack = (stackId: string) => {
    setExpandedStacks(prev => 
      prev.includes(stackId) 
        ? prev.filter(id => id !== stackId)
        : [...prev, stackId]
    );
  };

  const getWeatherIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <Zap className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <CloudRain className="w-4 h-4 text-red-500" />;
      default:
        return <Wind className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStackTypeColor = (type: string) => {
    switch (type) {
      case 'primary':
        return 'bg-blue-500/10 text-blue-500';
      case 'contrarian':
        return 'bg-purple-500/10 text-purple-500';
      case 'leverage':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getProgressColor = (value: number, type: 'points' | 'ownership') => {
    if (type === 'points') {
      if (value >= 80) return 'bg-gradient-to-r from-green-500 to-green-600';
      if (value >= 50) return 'bg-gradient-to-r from-blue-500 to-blue-600';
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
    } else {
      if (value >= 25) return 'bg-gradient-to-r from-red-500 to-red-600';
      if (value >= 15) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      return 'bg-gradient-to-r from-green-500 to-green-600';
    }
  };

  const getOwnershipLabel = (ownership: number) => {
    if (ownership >= 25) return 'High ownership - better for cash';
    if (ownership >= 15) return 'Moderate ownership - balanced play';
    return 'Low ownership - great for GPPs';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Top Game Stacks</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Correlation
          </Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        {gameStacks.map((stack) => (
          <Collapsible 
            key={stack.id}
            open={expandedStacks.includes(stack.id)}
            onOpenChange={() => toggleStack(stack.id)}
          >
            <Card className={cn(
              "transition-shadow duration-200",
              expandedStacks.includes(stack.id) ? "shadow-lg" : "hover:shadow-md"
            )}>
              <CollapsibleTrigger className="w-full">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{stack.game}</h4>
                        <Badge className={getStackTypeColor(stack.stackType)}>
                          {stack.stackType.charAt(0).toUpperCase() + stack.stackType.slice(1)} Stack
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {(stack.correlation * 100).toFixed(0)}% correlation
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{stack.projectedPoints.toFixed(1)} pts</span>
                        <span>{stack.ownership.toFixed(1)}% owned</span>
                        <span>${stack.totalSalary.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getWeatherIcon(stack.weatherImpact)}
                      {expandedStacks.includes(stack.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Projected Points</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Projected points relative to slate average</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className={cn(
                            "h-2 rounded-full",
                            getProgressColor(75, 'points')
                          )} style={{ width: '75%' }} />
                        </div>
                        <span className="text-sm font-medium">{stack.projectedPoints.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Total Ownership</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getOwnershipLabel(stack.ownership)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className={cn(
                            "h-2 rounded-full",
                            getProgressColor(stack.ownership, 'ownership')
                          )} style={{ width: `${stack.ownership}%` }} />
                        </div>
                        <span className="text-sm font-medium">{stack.ownership}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {stack.players.map((player, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{player.position}</Badge>
                          <span className="text-sm font-medium">{player.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            ${player.salary.toLocaleString()}
                          </span>
                          <Tooltip>
                            <TooltipTrigger className="text-sm text-muted-foreground">
                              {player.projection} pts
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Projected points for {player.name}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger className="text-sm text-muted-foreground">
                              {player.ownership}% owned
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getOwnershipLabel(player.ownership)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    {stack.insights.map((insight, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {insight}
                      </p>
                    ))}
                  </div>

                  <Button className="w-full flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Stack to Optimizer
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}