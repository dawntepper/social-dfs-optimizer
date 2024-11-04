'use client';

import { useEffect } from 'react';
import { ProjectionAlerts } from '@/components/alerts/ProjectionAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, TrendingUp, MessageCircle } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Alerts Dashboard</h1>
      </div>

      <Tabs defaultValue="projections">
        <TabsList>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Projection Changes
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Social Updates
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            All Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projections" className="mt-4">
          <ProjectionAlerts />
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time social media updates will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Combined view of all alerts will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}