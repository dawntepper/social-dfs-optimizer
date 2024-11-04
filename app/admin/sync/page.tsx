'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Cloud } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SyncStatus {
  lastSync: string | null;
  status: string;
  error?: string;
}

interface ServiceStatus {
  espn: SyncStatus | null;
  weather: SyncStatus | null;
}

export default function SyncPage() {
  const [status, setStatus] = useState<ServiceStatus>({
    espn: null,
    weather: null
  });
  const [loading, setLoading] = useState({
    espn: false,
    weather: false
  });
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const [espnResponse, weatherResponse] = await Promise.all([
        fetch('/api/sync/espn/status'),
        fetch('/api/sync/weather/status')
      ]);

      if (!espnResponse.ok || !weatherResponse.ok) {
        throw new Error('Failed to fetch sync status');
      }

      const [espnData, weatherData] = await Promise.all([
        espnResponse.json(),
        weatherResponse.json()
      ]);

      setStatus({
        espn: espnData,
        weather: weatherData
      });
    } catch (error) {
      console.error('Error fetching sync status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sync status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async (service: 'espn' | 'weather') => {
    setLoading(prev => ({ ...prev, [service]: true }));
    try {
      const response = await fetch(`/api/sync/${service}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Sync failed');
      
      toast({
        title: "Success",
        description: `${service.toUpperCase()} data sync initiated`,
      });
      
      await fetchStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate sync",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [service]: false }));
    }
  };

  const getStatusBadge = (serviceStatus: SyncStatus | null) => {
    switch (serviceStatus?.status) {
      case 'completed':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-4 h-4 mr-1" />
            Failed
          </Badge>
        );
      case 'started':
        return (
          <Badge className="bg-blue-500">
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-4 h-4 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Data Sync Management</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ESPN Data Sync</CardTitle>
              {getStatusBadge(status.espn)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Sync</p>
                  <p className="font-medium">
                    {status.espn?.lastSync 
                      ? new Date(status.espn.lastSync).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <Button
                  onClick={() => handleSync('espn')}
                  disabled={loading.espn || status.espn?.status === 'started'}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading.espn ? 'animate-spin' : ''}`} />
                  {loading.espn ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>

              {status.espn?.error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                  <p className="font-medium">Last Sync Error:</p>
                  <p className="text-sm">{status.espn.error}</p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Syncs automatically every 15 minutes</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Player data and stats</li>
                  <li>Team information</li>
                  <li>Injury updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weather Data Sync</CardTitle>
              {getStatusBadge(status.weather)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Sync</p>
                  <p className="font-medium">
                    {status.weather?.lastSync 
                      ? new Date(status.weather.lastSync).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <Button
                  onClick={() => handleSync('weather')}
                  disabled={loading.weather || status.weather?.status === 'started'}
                >
                  <Cloud className={`w-4 h-4 mr-2 ${loading.weather ? 'animate-spin' : ''}`} />
                  {loading.weather ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>

              {status.weather?.error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                  <p className="font-medium">Last Sync Error:</p>
                  <p className="text-sm">{status.weather.error}</p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Syncs automatically every 30 minutes</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Temperature and conditions</li>
                  <li>Wind speed and direction</li>
                  <li>Precipitation probability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}