import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InjuryStatuses, getStatusColor, getImpactColor } from '@/lib/types/injuries';
import { AlertTriangle } from 'lucide-react';

interface InjuryBadgeProps {
  status: keyof typeof InjuryStatuses;
  type: string;
  impactRating: number;
}

export function InjuryBadge({ status, type, impactRating }: InjuryBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1 ${getStatusColor(status)}`}
        >
          <AlertTriangle className={`w-3 h-3 ${getImpactColor(impactRating)}`} />
          {InjuryStatuses[status]}: {type}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Impact Rating: {impactRating}/10</p>
      </TooltipContent>
    </Tooltip>
  );
}