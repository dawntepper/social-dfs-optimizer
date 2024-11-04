'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SentimentMonitor } from '@/components/dashboard/SentimentMonitor';
import { TwitterFeed } from '@/components/social/TwitterFeed';
import { RedditFeed } from '@/components/social/RedditFeed';
import { AlertFilters } from '@/components/alerts/AlertFilters';
import { ProjectionAlerts } from '@/components/alerts/ProjectionAlerts';

export default function SocialAnalysisPage() {
  const [activeTab, setActiveTab] = useState('monitor');

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
              <TabsTrigger value="reddit">Reddit</TabsTrigger>
            </TabsList>

            <TabsContent value="monitor">
              <SentimentMonitor />
            </TabsContent>

            <TabsContent value="twitter">
              <TwitterFeed tweets={[]} loading={false} />
            </TabsContent>

            <TabsContent value="reddit">
              <RedditFeed posts={[]} loading={false} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <AlertFilters onFilter={() => {}} />
          <ProjectionAlerts />
        </div>
      </div>
    </div>
  );
}