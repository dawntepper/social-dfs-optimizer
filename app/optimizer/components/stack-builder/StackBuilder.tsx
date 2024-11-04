'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StackControls } from './stack-builder/StackControls';
import { StackList } from './stack-builder/StackList';
import { Stack } from '@/lib/types/dfs';
import { stackBuilder } from '@/lib/services/lineups/StackBuilder';
import { useToast } from '@/components/ui/use-toast';
import { slateService } from '@/lib/services/dfs/SlateDataService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StackBuilderProps {
  stacks: Stack[];
  onStackChange: (stacks: Stack[]) => void;
  disabled?: boolean;
  contestType?: string;
}

export default function StackBuilder({ 
  stacks, 
  onStackChange, 
  disabled = false,
  contestType = 'gpp'
}: StackBuilderProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeStacks = async () => {
      const slateContent = localStorage.getItem('current_slate');
      if (!slateContent) {
        setError('No slate data found. Please upload a slate first.');
        return;
      }

      try {
        slateService.loadSlateData(slateContent);
        await generateTopStacks();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load slate data';
        console.error('Error loading slate data:', error);
        setError(message);
      }
    };

    initializeStacks();
  }, [contestType]);

  const generateTopStacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const players = slateService.getPlayerPool();
      
      if (!players || players.length === 0) {
        throw new Error('No players available. Please upload a slate first.');
      }

      const validPlayers = players.filter(p => 
        p && p.name && p.position && p.team && p.salary && p.projectedPoints
      );

      if (validPlayers.length === 0) {
        throw new Error('No valid players found in the slate. Please check the player data.');
      }

      const topStacks = await stackBuilder.buildTopStacks(validPlayers, contestType);
      
      if (!topStacks || topStacks.length === 0) {
        throw new Error('No valid stacks could be generated from the available players.');
      }

      onStackChange(topStacks);

      toast({
        title: "Top Stacks Generated",
        description: `Generated ${topStacks.length} recommended stacks for ${contestType.toUpperCase()}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate top stacks';
      console.error('Failed to generate top stacks:', error);
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = async (team: string) => {
    setSelectedTeam(team);
    if (!team) return;

    try {
      setLoading(true);
      setError(null);
      const players = slateService.getPlayers(team);
      
      if (!players || players.length === 0) {
        throw new Error('No players available for selected team');
      }

      const validPlayers = players.filter(p => 
        p && p.name && p.position && p.team && p.salary && p.projectedPoints
      );

      if (validPlayers.length === 0) {
        throw new Error('No valid players found for the selected team');
      }

      const recommendedStacks = await stackBuilder.buildTopStacks(validPlayers, contestType);
      if (recommendedStacks && recommendedStacks.length > 0) {
        onStackChange([recommendedStacks[0], ...stacks]);
        toast({
          title: 'Stack Added',
          description: `Added recommended stack for ${team}`,
        });
      } else {
        throw new Error('No valid stacks could be generated for the selected team');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate recommended stack';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewStack = async (template: string) => {
    if (!selectedTeam) {
      toast({
        title: 'Error',
        description: 'Please select a team first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const players = slateService.getPlayers(selectedTeam);
      
      if (!players || players.length === 0) {
        throw new Error('No players available for selected team');
      }

      const validPlayers = players.filter(p => 
        p && p.name && p.position && p.team && p.salary && p.projectedPoints
      );

      if (validPlayers.length === 0) {
        throw new Error('No valid players found for the selected team');
      }

      const newStack = await stackBuilder.buildTopStacks(validPlayers, template);
      if (newStack && newStack.length > 0) {
        onStackChange([newStack[0], ...stacks]);
        toast({
          title: 'Stack Added',
          description: `Successfully added ${template} stack for ${selectedTeam}`,
        });
      } else {
        throw new Error('Could not generate the requested stack type');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate stack';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStack = (index: number) => {
    const newStacks = [...stacks];
    newStacks.splice(index, 1);
    onStackChange(newStacks);
  };

  const handleAddToLineups = (stackId: string, percentage: number) => {
    toast({
      title: 'Stack Added',
      description: `Stack will be used in ${percentage}% of lineups`,
    });
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stack Builder</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              <StackControls
                selectedTeam={selectedTeam}
                onTeamChange={handleTeamChange}
                onViewStack={handleViewStack}
                disabled={disabled}
                loading={loading}
                error={error}
              />

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <StackList 
                  stacks={stacks}
                  onRemoveStack={handleRemoveStack}
                  onAddToLineups={handleAddToLineups}
                  error={error}
                />
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}