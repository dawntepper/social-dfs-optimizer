'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Wind, AlertCircle, History, TrendingUp, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherAlert {
  venue: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
}

interface WeatherTrend {
  date: string;
  temperature: number;
  windSpeed: number;
}

export default function WeatherPage() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [trends, setTrends] = useState<WeatherTrend[]>([]);
  const [recentImpacts, setRecentImpacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - will connect to actual weather service
    setAlerts([
      {
        venue: 'Arrowhead Stadium (Kansas City Chiefs)',
        type: 'High Wind',
        severity: 'high',
        message: 'Sustained winds of 25mph expected during game time',
        timestamp: new Date().toISOString()
      },
      {
        venue: 'Highmark Stadium (Buffalo Bills)',
        type: 'Snow',
        severity: 'medium',
        message: '2-4 inches of snow expected before kickoff',
        timestamp: new Date().toISOString()
      }
    ]);

    setTrends([
      { date: '2024-01-15', temperature: 45, windSpeed: 8 },
      { date: '2024-01-16', temperature: 42, windSpeed: 12 },
      { date: '2024-01-17', temperature: 38, windSpeed: 15 },
      { date: '2024-01-18', temperature: 35, windSpeed: 18 },
      { date: '2024-01-19', temperature: 32, windSpeed: 20 }
    ]);

    setRecentImpacts([
      {
        game: 'KC vs BUF',
        date: '2024-01-18',
        impact: 'High winds affected passing game efficiency (-15% completion rate)',
        severity: 'high'
      },
      {
        game: 'SF vs GB',
        date: '2024-01-17',
        impact: 'Rain led to increased rushing attempts (+12 attempts)',
        severity: 'medium'
      }
    ]);

    setLoading(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Weather Analysis</h1>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Weather Analysis</h1>

      {/* Active Weather Alerts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Weather Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.type}
                    </Badge>
                    <span className="font-medium">{alert.venue}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* NFL Section */}
        <Link href="/weather/nfl">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                NFL Weather
                <ExternalLink className="w-4 h-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track weather conditions for NFL games, including temperature, wind, and precipitation impacts on gameplay.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Real-time weather updates</li>
                <li>• Historical weather comparisons</li>
                <li>• Impact analysis for passing and kicking</li>
                <li>• Stadium-specific conditions</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* MLB Section */}
        <Link href="/weather/mlb">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5" />
                MLB Weather
                <ExternalLink className="w-4 h-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Monitor baseball-specific weather factors including wind direction, humidity, and carry distance impacts.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Ball carry distance calculations</li>
                <li>• Park-specific factors</li>
                <li>• Historical weather trends</li>
                <li>• First pitch conditions</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Weather Trends */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Weather Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="temp" orientation="left" />
                <YAxis yAxisId="wind" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="hsl(var(--primary))" 
                  name="Temperature (°F)"
                />
                <Line 
                  yAxisId="wind"
                  type="monotone" 
                  dataKey="windSpeed" 
                  stroke="hsl(var(--secondary))" 
                  name="Wind Speed (mph)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Weather Impacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Weather Impacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentImpacts.map((impact, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{impact.game}</span>
                    <Badge variant="outline">{impact.date}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{impact.impact}</p>
                </div>
                <Badge className={getSeverityColor(impact.severity)}>
                  {impact.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}