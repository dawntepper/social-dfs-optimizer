'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InjuryBadge } from './InjuryBadge';
import { currentInjuries } from '@/lib/data/injuries';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

interface InjuryListProps {
  team?: string;
  minimal?: boolean;
}

export function InjuryList({ team, minimal = false }: InjuryListProps) {
  const injuries = team 
    ? currentInjuries.filter(injury => injury.team === team)
    : currentInjuries;

  if (injuries.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground p-4">
        <ShieldCheck className="w-5 h-5 text-green-500" />
        <span>No reported injuries at this time</span>
      </div>
    );
  }

  if (minimal) {
    return (
      <div className="flex flex-wrap gap-2">
        {injuries.map((injury, idx) => (
          <InjuryBadge
            key={idx}
            status={injury.status}
            type={injury.type}
            impactRating={injury.impactRating}
          />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {team ? `${team} Injuries` : 'Current Injuries'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {injuries.map((injury, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{injury.position}</Badge>
                <span className="font-medium">{injury.player}</span>
              </div>
              <InjuryBadge
                status={injury.status}
                type={injury.type}
                impactRating={injury.impactRating}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}