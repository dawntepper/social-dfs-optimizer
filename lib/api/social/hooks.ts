import { useState, useEffect } from 'react';

export function usePlayerSentiment(playerId: string) {
  const [sentiment, setSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/social?playerId=${playerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch social data');
        }

        const data = await response.json();
        setSentiment(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchSentiment();
    }
  }, [playerId]);

  return { sentiment, loading, error };
}