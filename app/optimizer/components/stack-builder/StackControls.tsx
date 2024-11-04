'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TeamSelector } from './TeamSelector';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface StackControlsProps {
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  onViewStack: (template: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
}

const STACK_TEMPLATES = {
  'QB-WR': {
    name: 'QB + WR Stack',
    positions: ['QB', 'WR'],
    description: 'Basic passing game correlation'
  },
  'QB-WR-WR': {
    name: 'QB + 2 WR Stack',
    positions: ['QB', 'WR', 'WR'],
    description: 'Double stack for high upside'
  },
  'QB-TE': {
    name: 'QB + TE Stack',
    positions: ['QB', 'TE'],
    description: 'Red zone correlation'
  },
  'QB-WR-TE': {
    name: 'QB + WR + TE Stack',
    positions: ['QB', 'WR', 'TE'],
    description: 'Full passing game correlation'
  },
  'RB-DEF': {
    name: 'RB + DEF Stack',
    positions: ['RB', 'DEF'],
    description: 'Game script correlation'
  }
};

export function StackControls({ 
  selectedTeam, 
  onTeamChange, 
  onViewStack,
  disabled,
  loading,
  error 
}: StackControlsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('QB-WR');

  const handleViewStack = () => {
    if (!selectedTeam) {
      return;
    }
    onViewStack(selectedTemplate);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <TeamSelector
          selectedTeam={selectedTeam}
          onTeamChange={onTeamChange}
          disabled={disabled || loading}
        />

        <Select
          value={selectedTemplate}
          onValueChange={setSelectedTemplate}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select stack type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STACK_TEMPLATES).map(([key, template]) => (
              <SelectItem key={key} value={key}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={handleViewStack}
          disabled={!selectedTeam || disabled || loading}
        >
          {loading ? 'Loading...' : 'View Stack'}
        </Button>
      </div>

      {selectedTemplate && STACK_TEMPLATES[selectedTemplate] && (
        <p className="text-sm text-muted-foreground">
          {STACK_TEMPLATES[selectedTemplate].description}
        </p>
      )}
    </div>
  );
}