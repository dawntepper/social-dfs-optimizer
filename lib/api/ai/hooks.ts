import { useState, useEffect } from 'react';

export function usePlayerAnalysis(playerId: string) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/ai?playerId=${playerId}&type=player`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI analysis');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchAnalysis();
    }
  }, [playerId]);

  return { analysis, loading, error };
}

export function useCorrelationAnalysis(gameId: string) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/ai?gameId=${gameId}&type=correlation`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch correlation analysis');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchAnalysis();
    }
  }, [gameId]);

  return { analysis, loading, error };
}