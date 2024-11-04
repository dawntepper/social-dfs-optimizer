import { useState, useEffect } from 'react';
import { WeatherData } from '@/lib/types/projections';

export function useGameWeather(gameId: string, homeTeam: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/weather?gameId=${gameId}&homeTeam=${homeTeam}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId && homeTeam) {
      fetchWeather();
    }
  }, [gameId, homeTeam]);

  return { weather, loading, error };
}