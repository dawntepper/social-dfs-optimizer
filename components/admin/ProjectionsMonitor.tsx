'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectionTester } from './projections/ProjectionTester';
import { PositionMetrics } from './projections/PositionMetrics';
import { ImpactAnalysis } from './projections/ImpactAnalysis';
import { TestHistory } from './projections/TestHistory';

export function ProjectionsMonitor() {
  const [activeTab, setActiveTab] = useState('tester');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Projection System Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="tester">Test Projections</TabsTrigger>
              <TabsTrigger value="metrics">Position Metrics</TabsTrigger>
              <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
              <TabsTrigger value="history">Test History</TabsTrigger>
            </TabsList>

            <TabsContent value="tester" className="mt-4">
              <ProjectionTester />
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <PositionMetrics />
            </TabsContent>

            <TabsContent value="impact" className="mt-4">
              <ImpactAnalysis />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <TestHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}