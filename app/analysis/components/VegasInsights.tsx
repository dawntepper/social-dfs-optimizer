'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const vegasData = [
  {
    game: 'KC vs LV',
    total: 51.5,
    spread: -7.5,
    impliedTotal: 29.5,
    lineMovement: +1.5,
    weather: 'Clear, 72°F, 5mph wind',
  },
  {
    game: 'SF vs LAR',
    total: 47.5,
    spread: -9.5,
    impliedTotal: 28.5,
    lineMovement: -0.5,
    weather: 'Partly cloudy, 65°F, 12mph wind',
  },
];

export default function VegasInsights() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Vegas & Weather Insights</h3>

      {vegasData.map((game, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">{game.game}</h4>
              <span className="text-sm text-muted-foreground">
                O/U {game.total}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Spread</p>
                <p className="font-semibold">{game.spread}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Implied Total</p>
                <p className="font-semibold">{game.impliedTotal}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                <span className={game.lineMovement > 0 ? 'text-green-500' : 'text-red-500'}>
                  {game.lineMovement > 0 ? '↑' : '↓'} {Math.abs(game.lineMovement)}
                </span>
                {' '}line movement
              </p>
              <p className="text-sm">{game.weather}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}