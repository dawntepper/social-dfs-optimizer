'use client';

import { useState, useEffect } from 'react';
import PlayerPool from './components/PlayerPool';
import OptimizerSettings from './components/OptimizerSettings';
import LineupBuilder from './components/LineupBuilder';
import SocialFeed from './components/SocialFeed';
import SlateSelector from './components/SlateSelector';
import StackBuilder from './components/StackBuilder';
import { Stack } from '@/lib/types/dfs';
import { lineupOptimizer } from '@/lib/services/lineups/LineupOptimizerService';
import { useToast } from '@/components/ui/use-toast';
import { slateService } from '@/lib/services/dfs/SlateDataService';

export default function OptimizerPage() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [lineups, setLineups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    contestType: 'gpp',
    lineupCount: 20,
    maxSalary: 50000,
    maxOwnership: 25,
    minOwnership: 5,
    uniqueness: 3,
    correlationThreshold: 0.6,
    maxExposure: 30
  });
  const { toast } = useToast();

  const handleSlateDownloaded = (csvContent: string, site: 'draftkings' | 'fanduel') => {
    console.log('OptimizerPage: Slate downloaded', { site });
    localStorage.setItem('current_slate', csvContent);
    slateService.loadSlateData(csvContent);
  };

  const handleStackChange = (newStacks: Stack[]) => {
    console.log('OptimizerPage: Stack changed', { stackCount: newStacks.length });
    setStacks(newStacks);
  };

  const handleSettingsChange = (newSettings: any) => {
    console.log('OptimizerPage: Settings changed', newSettings);
    setSettings(newSettings);
  };

  const handleOptimize = async () => {
    try {
      console.log('OptimizerPage: Starting optimization...');
      setLoading(true);
      
      // Get all available players from the slate
      const allPlayers = slateService.getPlayerPool();
      console.log('OptimizerPage: Player pool size:', allPlayers?.length || 0);
      
      if (!allPlayers || allPlayers.length === 0) {
        throw new Error('No players available. Please upload a slate first.');
      }
      
      // Filter to selected players if any are selected
      const players = selectedPlayers.length > 0 
        ? allPlayers.filter(p => selectedPlayers.includes(p.id))
        : allPlayers;

      console.log('OptimizerPage: Selected players:', players.length);

      if (players.length === 0) {
        throw new Error('No players selected for optimization');
      }

      // Generate lineups
      console.log('OptimizerPage: Calling lineup optimizer with settings:', settings);
      const result = await lineupOptimizer.optimizeLineups(players, {
        contestType: settings.contestType,
        maxOwnership: settings.maxOwnership,
        minOwnership: settings.minOwnership,
        maxExposure: settings.maxExposure,
        uniqueness: settings.uniqueness,
        correlationThreshold: settings.correlationThreshold
      });

      console.log('OptimizerPage: Optimization result:', {
        lineupCount: result.lineups.length,
        errorCount: result.errors.length
      });

      setLineups(result.lineups);

      if (result.errors.length > 0) {
        console.warn('OptimizerPage: Optimization warnings:', result.errors);
      }

      toast({
        title: "Lineups Generated",
        description: `Successfully created ${result.lineups.length} lineups`,
      });
    } catch (error) {
      console.error('OptimizerPage: Optimization error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate lineups",
        variant: "destructive"
      });
      setLineups([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">NFL DFS Optimizer</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SlateSelector onSlateDownloaded={handleSlateDownloaded} />
          <OptimizerSettings 
            onSettingsChange={handleSettingsChange} 
            onOptimize={handleOptimize}
          />
          <StackBuilder 
            stacks={stacks}
            onStackChange={handleStackChange}
          />
          <PlayerPool 
            selectedPlayers={selectedPlayers}
            onSelectPlayers={setSelectedPlayers}
          />
          <LineupBuilder 
            lineups={lineups}
            loading={loading}
          />
        </div>
        <div className="space-y-6">
          <SocialFeed />
        </div>
      </div>
    </div>
  );
}