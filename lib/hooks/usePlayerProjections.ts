import { useState, useEffect } from 'react';
import { Player } from '@/lib/types/dfs';
import { useToast } from '@/components/ui/use-toast';

interface UsePlayerProjectionsResult {
  player: Player | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePlayerProjections(playerId: string): UsePlayerProjectionsResult {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchProjection = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ players: [{ id: playerId }] }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch player projection');
      }

      const data = await response.json();
      
      if (!data.players?.[0]) {
        throw new Error('Player not found');
      }

      setPlayer(data.players[0]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playerId) {
      fetchProjection();
    }
  }, [playerId]);

  return {
    player,
    loading,
    error,
    refresh: fetchProjection
  };
}