import { useState, useEffect } from 'react';
import { ESPNPlayer, ESPNTeam } from '@/lib/types/espn';
import { useToast } from '@/components/ui/use-toast';

export function usePlayerStats(playerId: string) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/espn?playerId=${playerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch player stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err);
        toast({
          title: "Error",
          description: "Failed to load player stats",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchStats();
    }
  }, [playerId, toast]);

  return { stats, loading, error };
}

export function useSyncESPNData() {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const sync = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/sync/espn', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to sync ESPN data');
      }

      setLastSyncTime(new Date());
      toast({
        title: "Success",
        description: "ESPN data synced successfully",
      });
    } catch (err) {
      setError(err);
      toast({
        title: "Error",
        description: "Failed to sync ESPN data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return { sync, syncing, lastSyncTime, error };
}

export function useTeamSchedule(teamId: string) {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/espn/schedule?teamId=${teamId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch team schedule');
        }

        const data = await response.json();
        setSchedule(data);
      } catch (err) {
        setError(err);
        toast({
          title: "Error",
          description: "Failed to load team schedule",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchSchedule();
    }
  }, [teamId, toast]);

  return { schedule, loading, error };
}

export function usePlayerProjections(playerId: string) {
  const [projections, setProjections] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { stats } = usePlayerStats(playerId);
  const { toast } = useToast();

  useEffect(() => {
    const calculateProjections = async () => {
      try {
        setLoading(true);
        
        if (!stats) {
          throw new Error('No stats available');
        }

        // Calculate projections based on historical stats
        const calculated = await fetch(`/api/espn/projections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stats }),
        });

        if (!calculated.ok) {
          throw new Error('Failed to calculate projections');
        }

        const data = await calculated.json();
        setProjections(data);
      } catch (err) {
        setError(err);
        toast({
          title: "Error",
          description: "Failed to calculate projections",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (stats) {
      calculateProjections();
    }
  }, [stats, toast]);

  return { projections, loading, error };
}

export function useTeamCorrelations(teamId: string) {
  const [correlations, setCorrelations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCorrelations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/espn/correlations?teamId=${teamId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch team correlations');
        }

        const data = await response.json();
        setCorrelations(data);
      } catch (err) {
        setError(err);
        toast({
          title: "Error",
          description: "Failed to load team correlations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchCorrelations();
    }
  }, [teamId, toast]);

  return { correlations, loading, error };
}