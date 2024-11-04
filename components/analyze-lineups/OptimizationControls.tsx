'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OptimizationControlsProps {
  onOptimize: (settings: any) => void;
}

export function OptimizationControls({ onOptimize }: OptimizationControlsProps) {
  const [settings, setSettings] = useState({
    contestType: 'mid-size',
    maxOwnership: 25,
    minOwnership: 5,
    uniqueness: 3,
    correlationThreshold: 0.6,
    maxExposure: 30
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Contest Type</Label>
            <Select 
              value={settings.contestType}
              onValueChange={(value) => setSettings({ ...settings, contestType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contest type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mid-size">Mid-Size GPP (11.8K)</SelectItem>
                <SelectItem value="large-field">Large-Field GPP (150K+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Max Player Ownership</Label>
            <Slider 
              value={[settings.maxOwnership]}
              onValueChange={(value) => setSettings({ ...settings, maxOwnership: value[0] })}
              min={0}
              max={100}
              step={1}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {settings.maxOwnership}%
            </div>
          </div>

          <div>
            <Label>Lineup Uniqueness</Label>
            <Slider 
              value={[settings.uniqueness]}
              onValueChange={(value) => setSettings({ ...settings, uniqueness: value[0] })}
              min={1}
              max={5}
              step={1}
            />
            <div className="text-sm text-muted-foreground mt-1">
              Level {settings.uniqueness} of 5
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={() => onOptimize(settings)}
          >
            Generate Optimized Lineups
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}