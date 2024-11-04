'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { slateService } from '@/lib/services/dfs/SlateDataService';

interface TeamSelectorProps {
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  disabled?: boolean;
}

export function TeamSelector({ selectedTeam, onTeamChange, disabled }: TeamSelectorProps) {
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    // Get teams from the current slate
    const availableTeams = slateService.getAllTeams();
    setTeams(availableTeams);
  }, []);

  return (
    <Select
      value={selectedTeam}
      onValueChange={onTeamChange}
      disabled={disabled || teams.length === 0}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select team" />
      </SelectTrigger>
      <SelectContent>
        {teams.map(team => (
          <SelectItem key={team} value={team}>
            {team}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}