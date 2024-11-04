'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CorrelationMatrix from './components/CorrelationMatrix';
import GameStacks from './components/GameStacks';
import PlayerInsights from './components/PlayerInsights';
import VegasInsights from './components/VegasInsights';
import GameSlateAnalysis from './components/GameSlateAnalysis';
import { GameSlateSkeleton } from '@/components/skeletons/GameSlateSkeleton';
import { CorrelationMatrixSkeleton } from '@/components/skeletons/CorrelationMatrixSkeleton';
import { PlayerInsightsSkeleton } from '@/components/skeletons/PlayerInsightsSkeleton';
import { VegasInsightsSkeleton } from '@/components/skeletons/VegasInsightsSkeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { slateService } from '@/lib/services/dfs/SlateDataService';

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState(searchParams.get('team') || 'BUF');

  useEffect(() => {
    // Load slate data
    const slateData = localStorage.getItem('current_slate');
    if (slateData) {
      slateService.loadSlateData(slateData);
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Update URL when team changes
  const handleTeamChange = (team: string) => {
    setSelectedTeam(team);
    router.push(`/analysis?team=${team}`);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <h1 className="text-3xl font-bold mb-6">NFL DFS Analysis</h1>
      
      <div className="space-y-6">
        {loading ? (
          <>
            <GameSlateSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <CorrelationMatrixSkeleton />
              </Card>
              <Card className="p-4">
                <PlayerInsightsSkeleton />
              </Card>
            </div>
          </>
        ) : (
          <>
            <GameSlateAnalysis selectedTeam={selectedTeam} onTeamChange={handleTeamChange} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <Tabs defaultValue="correlation">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="correlation">Correlation</TabsTrigger>
                    <TabsTrigger value="stacks">Game Stacks</TabsTrigger>
                  </TabsList>
                  <TabsContent value="correlation">
                    <CorrelationMatrix selectedTeam={selectedTeam} />
                  </TabsContent>
                  <TabsContent value="stacks">
                    <GameStacks selectedTeam={selectedTeam} />
                  </TabsContent>
                </Tabs>
              </Card>

              <Card className="p-4">
                <Tabs defaultValue="players">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="players">Player Insights</TabsTrigger>
                    <TabsTrigger value="vegas">Vegas Data</TabsTrigger>
                  </TabsList>
                  <TabsContent value="players">
                    <PlayerInsights selectedTeam={selectedTeam} />
                  </TabsContent>
                  <TabsContent value="vegas">
                    <VegasInsights selectedTeam={selectedTeam} />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}