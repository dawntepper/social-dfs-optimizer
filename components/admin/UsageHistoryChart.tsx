'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageHistoryChartProps {
  data: any[];
  loading: boolean;
}

export function UsageHistoryChart({ data = [], loading = false }: UsageHistoryChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Usage History (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Usage History (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [value, 'Requests']}
                />
                <Line 
                  type="monotone" 
                  dataKey="openai" 
                  name="OpenAI" 
                  stroke="hsl(var(--primary))" 
                />
                <Line 
                  type="monotone" 
                  dataKey="weather" 
                  name="Weather" 
                  stroke="hsl(var(--secondary))" 
                />
                <Line 
                  type="monotone" 
                  dataKey="vegas" 
                  name="Vegas" 
                  stroke="hsl(var(--destructive))" 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No usage data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}