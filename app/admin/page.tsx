'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectionsMonitor } from '@/components/admin/ProjectionsMonitor';
import { APITestPanel } from '@/components/admin/APITestPanel';
import { UsageHistoryChart } from '@/components/admin/UsageHistoryChart';
import { Brain, LineChart, AlertCircle, Shield, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('metrics');

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            System Metrics
          </TabsTrigger>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Projections
          </TabsTrigger>
          <TabsTrigger value="api-tests" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            API Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4">
          <UsageHistoryChart />
        </TabsContent>

        <TabsContent value="projections" className="mt-4">
          <ProjectionsMonitor />
        </TabsContent>

        <TabsContent value="api-tests" className="mt-4">
          <APITestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}