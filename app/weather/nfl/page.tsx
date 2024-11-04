'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Home, Cloud, Wind, Droplets } from 'lucide-react';

export default function NFLWeatherPage() {
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch('/api/weather/nfl');
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/"><Home className="h-4 w-4" /></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/weather">Weather</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>NFL</BreadcrumbItem>
        </Breadcrumb>
        
        <div className="mt-6 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/"><Home className="h-4 w-4" /></BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/weather">Weather</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>NFL</BreadcrumbItem>
      </Breadcrumb>

      <div className="mt-6">
        <h1 className="text-3xl font-bold mb-6">NFL Stadium Weather</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            weatherData.map((stadium, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {stadium.stadium}
                        {stadium.isIndoors && (
                          <Badge variant="secondary">Indoor Stadium</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Home of the {stadium.team}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(stadium.kickoff).toLocaleTimeString([], { 
                        hour: 'numeric', 
                        minute: '2-digit'
                      })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-sm text-primary mb-2">Weather Conditions</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4 text-muted-foreground" />
                          <span>{stadium.temperature}°F</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-muted-foreground" />
                          <span>{stadium.windSpeed} mph</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                          <span>{stadium.precipitation}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-primary mb-2">Vegas Lines</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-medium">{stadium.total}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Spread</p>
                          <p className="font-medium">{stadium.spread}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-primary mb-2">Teams</h3>
                      <div className="flex items-center justify-between">
                        <span>{stadium.homeTeam}</span>
                        <span>vs</span>
                        <span>{stadium.awayTeam}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}