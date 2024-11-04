import { useState, useEffect } from 'react';

export function useGameOdds(gameId: string) {
  const [odds, setOdds] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vegas?gameId=${gameId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch odds data');
        }

        const data = await response.json();
        setOdds(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchOdds();
    }
  }, [gameId]);

  return { odds, loading, error };
}