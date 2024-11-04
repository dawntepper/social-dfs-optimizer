'use client';

import { Stack } from '@/lib/types/dfs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StackItemProps {
  stack: Stack;
  onRemove?: () => void;
}

export function StackItem({ stack, onRemove }: StackItemProps) {
  const getCorrelationColor = (correlation: number) => {
    if (correlation >= 0.7) return 'text-green-500';
    if (correlation >= 0.5) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  const getLeverageColor = (leverage: number) => {
    if (leverage >= 0.7) return 'text-green-500';
    if (leverage >= 0.5) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div>
            <span className="text-sm text-muted-foreground">{stack.team}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {stack.players.map(p => p.position).join('+')} Stack
              </span>
              <Badge variant="outline">
                ${stack.totalSalary.toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>
        {onRemove && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-4 text-sm">
          <Tooltip>
            <TooltipTrigger className={getCorrelationColor(stack.correlation)}>
              {(stack.correlation * 100).toFixed(0)}% correlation
            </TooltipTrigger>
            <TooltipContent>
              <p>Correlation strength:</p>
              <ul className="text-sm">
                <li>{'>'} 70%: Strong correlation (green)</li>
                <li>50-70%: Moderate correlation (blue)</li>
                <li>{'<'} 50%: Weak correlation (gray)</li>
              </ul>
            </TooltipContent>
          </Tooltip>
          <span>
            {stack.projectedPoints.toFixed(1)} pts
          </span>
          <span className={getLeverageColor(stack.leverageScore)}>
            {(stack.leverageScore * 100).toFixed(1)}% leverage
          </span>
        </div>

        <div className="space-y-1">
          {stack.players.map((player, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between text-sm p-1 rounded hover:bg-muted/75"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{player.position}</Badge>
                {player.name}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>${player.salary.toLocaleString()}</span>
                <span>{player.projectedPoints.toFixed(1)} pts</span>
                <span>{player.ownership?.toFixed(1)}% owned</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}