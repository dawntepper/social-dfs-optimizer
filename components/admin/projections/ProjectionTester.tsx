'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Play, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Player {
  id: string;
  name: string;
  team: string;
  projectedPoints: number;
}

interface ProjectionResult {
  baseProjection: number;
  modifiedProjection: number;
  modifiers: {
    weather: number;
    vegas: number;
    social: number;
  };
  insights: string[];
  confidence: number;
}

const MOCK_PLAYERS: Record<string, Player[]> = {
  'QB': [
    { id: '1', name: 'Patrick Mahomes', team: 'KC', projectedPoints: 24.5 },
    { id: '2', name: 'Josh Allen', team: 'BUF', projectedPoints: 26.2 },
    { id: '3', name: 'Tua Tagovailoa', team: 'MIA', projectedPoints: 22.8 },
  ],
  'RB': [
    { id: '4', name: 'Christian McCaffrey', team: 'SF', projectedPoints: 25.4 },
    { id: '5', name: 'Austin Ekeler', team: 'LAC', projectedPoints: 20.2 },
    { id: '6', name: 'Raheem Mostert', team: 'MIA', projectedPoints: 18.5 },
  ],
  'WR': [
    { id: '7', name: 'Tyreek Hill', team: 'MIA', projectedPoints: 24.8 },
    { id: '8', name: 'Stefon Diggs', team: 'BUF', projectedPoints: 21.5 },
    { id: '9', name: 'Keenan Allen', team: 'LAC', projectedPoints: 20.8 },
  ],
  'TE': [
    { id: '10', name: 'Travis Kelce', team: 'KC', projectedPoints: 18.2 },
    { id: '11', name: 'George Kittle', team: 'SF', projectedPoints: 14.5 },
    { id: '12', name: 'Dalton Kincaid', team: 'BUF', projectedPoints: 11.2 },
  ]
};

// Mock API handler
const mockProjectionTest = async (requestData: { 
  player: string; 
  position: string; 
  baseProjection: number; 
}): Promise<ProjectionResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate random modifiers
  const weatherMod = 0.95 + Math.random() * 0.1;
  const vegasMod = 0.95 + Math.random() * 0.1;
  const socialMod = 0.95 + Math.random() * 0.1;

  const modifiedProjection = requestData.baseProjection * weatherMod * vegasMod * socialMod;

  return {
    baseProjection: requestData.baseProjection,
    modifiedProjection,
    modifiers: {
      weather: weatherMod,
      vegas: vegasMod,
      social: socialMod
    },
    insights: [
      `${requestData.player} has favorable matchup conditions`,
      `Weather conditions are ${weatherMod > 1 ? 'positive' : 'negative'} for scoring`,
      `Vegas lines suggest ${vegasMod > 1 ? 'higher' : 'lower'} than expected scoring`
    ],
    confidence: 0.7 + Math.random() * 0.2
  };
};

export function ProjectionTester() {
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [position, setPosition] = useState('QB');
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS['QB']);
  const [result, setResult] = useState<ProjectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPlayers(MOCK_PLAYERS[position] || []);
    setSelectedPlayer('');
    setResult(null);
    setError(null);
  }, [position]);

  const runTest = async () => {
    if (!selectedPlayer) {
      setError('Please select a player to test');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const selectedPlayerData = players.find(p => p.name === selectedPlayer);
      if (!selectedPlayerData) {
        throw new Error('Player data not found');
      }

      const requestData = {
        player: selectedPlayerData.name,
        position: position,
        baseProjection: selectedPlayerData.projectedPoints
      };

      // Use mock API handler instead of fetch
      const data = await mockProjectionTest(requestData);
      setResult(data);
      
      toast({
        title: "Test Complete",
        description: `Successfully tested projections for ${selectedPlayer}`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to test projection';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getModifierColor = (value: number) => {
    if (value > 1.02) return 'text-green-500';
    if (value < 0.98) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger>
            <SelectValue placeholder="Select Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="QB">Quarterbacks</SelectItem>
            <SelectItem value="RB">Running Backs</SelectItem>
            <SelectItem value="WR">Wide Receivers</SelectItem>
            <SelectItem value="TE">Tight Ends</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
          <SelectTrigger>
            <SelectValue placeholder="Select Player" />
          </SelectTrigger>
          <SelectContent>
            {players.map(player => (
              <SelectItem key={player.id} value={player.name}>
                {player.name} ({player.team})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={runTest} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Test Projection
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Base Projection</p>
                  <p className="text-2xl font-bold">{result.baseProjection.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modified Projection</p>
                  <p className="text-2xl font-bold">{result.modifiedProjection.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Impact Factors:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.modifiers).map(([key, value]) => (
                    <Badge 
                      key={key} 
                      variant="outline"
                      className={getModifierColor(value)}
                    >
                      {key}: {((value - 1) * 100).toFixed(1)}%
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Insights:</p>
                <ul className="space-y-1">
                  {result.insights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}