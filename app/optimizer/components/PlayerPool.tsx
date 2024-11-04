'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Player } from '@/lib/types/dfs';
import { slateService } from '@/lib/services/dfs/SlateDataService';

interface PlayerPoolProps {
  selectedPlayers?: string[];
  onSelectPlayers: (players: string[]) => void;
  onOptimize?: () => Promise<void>;
}

export default function PlayerPool({ 
  selectedPlayers = [], 
  onSelectPlayers,
  onOptimize 
}: PlayerPoolProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPlayers = () => {
      try {
        setLoading(true);
        setError(null);

        const slateContent = localStorage.getItem('current_slate');
        if (!slateContent) {
          setError('No slate loaded. Please upload a slate first.');
          return;
        }

        slateService.loadSlateData(slateContent);
        const playerPool = slateService.getPlayerPool();
        
        if (!playerPool || playerPool.length === 0) {
          setError('No players available. Please upload a slate first.');
          return;
        }

        setPlayers(playerPool);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load players';
        setError(message);
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [toast]);

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'current_slate') {
      loadPlayers();
    }
  };

  const loadPlayers = () => {
    try {
      setLoading(true);
      setError(null);

      const slateContent = localStorage.getItem('current_slate');
      if (!slateContent) {
        setError('No slate loaded. Please upload a slate first.');
        return;
      }

      slateService.loadSlateData(slateContent);
      const playerPool = slateService.getPlayerPool();
      
      if (!playerPool || playerPool.length === 0) {
        setError('No players available. Please upload a slate first.');
        return;
      }

      setPlayers(playerPool);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load players';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const togglePlayer = (playerId: string) => {
    const newSelected = selectedPlayers.includes(playerId)
      ? selectedPlayers.filter(id => id !== playerId)
      : [...selectedPlayers, playerId];
    onSelectPlayers(newSelected);
  };

  const handleOptimize = async () => {
    if (!onOptimize) return;

    try {
      setOptimizing(true);
      await onOptimize();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to optimize lineups';
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">Loading player pool...</p>
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Player Pool</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredPlayers.length} players
            </Badge>
            {onOptimize && (
              <Button 
                onClick={handleOptimize}
                disabled={optimizing}
              >
                {optimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  'Generate Lineups'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'QB', 'RB', 'WR', 'TE', 'DST'].map((pos) => (
                <Button
                  key={pos}
                  variant={positionFilter === pos ? 'default' : 'outline'}
                  onClick={() => setPositionFilter(pos)}
                  size="sm"
                >
                  {pos}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-[1fr,100px,100px,100px,100px] gap-4 mb-2 text-sm font-medium text-muted-foreground">
                <div>Player</div>
                <div>Salary</div>
                <div>Proj.</div>
                <div>Own%</div>
                <div>Value</div>
              </div>
              <div className="space-y-2">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`grid grid-cols-[1fr,100px,100px,100px,100px] gap-4 p-2 rounded-lg cursor-pointer hover:bg-muted ${
                      selectedPlayers.includes(player.id) ? 'bg-muted' : ''
                    }`}
                    onClick={() => togglePlayer(player.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{player.position}</Badge>
                      <span>{player.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {player.team}
                      </span>
                    </div>
                    <div>${player.salary.toLocaleString()}</div>
                    <div>{player.projectedPoints.toFixed(1)}</div>
                    <div>{player.ownership?.toFixed(1)}%</div>
                    <div>{player.value?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}