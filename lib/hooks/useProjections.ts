import { useState, useEffect } from 'react';
import { Player } from '@/lib/types/dfs';
import { useToast } from '@/components/ui/use-toast';

interface UseProjectionsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
}

interface UseProjectionsResult {
  players: Player[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useProjections(
  initialPlayers: Player[],
  options: UseProjectionsOptions = {}
): UseProjectionsResult {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    onError
  } = options;

  const fetchProjections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ players: initialPlayers }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enhanced projections');
      }

      const data = await response.json();
      
      if (!data.players) {
        throw new Error('Invalid response format');
      }

      setPlayers(data.players);

      // Show success toast only on manual refresh
      if (!autoRefresh) {
        toast({
          title: "Projections Updated",
          description: `Successfully enhanced ${data.players.length} player projections`,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProjections();
  }, [JSON.stringify(initialPlayers)]); // Deep compare initial players

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchProjections, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return {
    players,
    loading,
    error,
    refresh: fetchProjections
  };
}