'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface OptimizerSettingsProps {
  onSettingsChange: (settings: OptimizerSettings) => void;
  onOptimize: () => Promise<void>;
  disabled?: boolean;
}

export interface OptimizerSettings {
  contestType: 'gpp' | 'cash' | 'single';
  lineupCount: number;
  maxOwnership: number;
  minOwnership: number;
  uniqueness: number;
  correlationThreshold: number;
  maxExposure: number;
}

const DEFAULT_LINEUP_COUNTS = {
  gpp: 20,
  cash: 1,
  single: 1
};

export default function OptimizerSettings({ onSettingsChange, onOptimize, disabled = false }: OptimizerSettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [settings, setSettings] = useState<OptimizerSettings>({
    contestType: 'gpp',
    lineupCount: DEFAULT_LINEUP_COUNTS.gpp,
    maxOwnership: 25,
    minOwnership: 5,
    uniqueness: 3,
    correlationThreshold: 0.6,
    maxExposure: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSettingsChange = (key: keyof OptimizerSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };

    // Update lineup count when contest type changes
    if (key === 'contestType') {
      newSettings.lineupCount = DEFAULT_LINEUP_COUNTS[value];
    }

    // Validate lineup count
    if (key === 'lineupCount') {
      const count = parseInt(value);
      if (isNaN(count) || count < 1) {
        setError('Lineup count must be at least 1');
        return;
      }
      if (count > 150) {
        setError('Maximum lineup count is 150');
        return;
      }
      setError(null);
      newSettings.lineupCount = count;
    }

    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleOptimize = async () => {
    try {
      console.log('OptimizerSettings: Starting optimization...', settings);
      setLoading(true);
      setError(null);
      await onOptimize();
      console.log('OptimizerSettings: Optimization completed successfully');
      toast({
        title: "Success",
        description: `Generated ${settings.lineupCount} lineups successfully`,
      });
    } catch (err) {
      console.error('OptimizerSettings: Optimization error:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate lineups';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle>Optimizer Settings</CardTitle>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contest Type</Label>
                  <Select
                    value={settings.contestType}
                    onValueChange={(value: 'gpp' | 'cash' | 'single') => 
                      handleSettingsChange('contestType', value)
                    }
                    disabled={disabled || loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contest type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpp">GPP (Tournament)</SelectItem>
                      <SelectItem value="cash">Cash Game</SelectItem>
                      <SelectItem value="single">Single Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Lineups</Label>
                  <Input
                    type="number"
                    min={1}
                    max={150}
                    value={settings.lineupCount}
                    onChange={(e) => handleSettingsChange('lineupCount', e.target.value)}
                    disabled={disabled || loading}
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleOptimize}
                disabled={disabled || loading || !!error}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating {settings.lineupCount} lineup{settings.lineupCount !== 1 ? 's' : ''}...
                  </>
                ) : (
                  `Generate ${settings.lineupCount} Lineup${settings.lineupCount !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}