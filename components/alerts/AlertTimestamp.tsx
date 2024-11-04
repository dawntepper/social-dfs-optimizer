'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface AlertTimestampProps {
  timestamp: number;
  slateTime?: string;
}

export function AlertTimestamp({ timestamp, slateTime }: AlertTimestampProps) {
  const date = new Date(timestamp);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  let timeDisplay = formatDistanceToNow(date, { addSuffix: true });
  let variant: 'default' | 'secondary' | 'destructive' = 'default';

  // Show exact time for alerts more than 24 hours old
  if (minutesAgo > 24 * 60) {
    timeDisplay = format(date, 'MMM d, h:mm a');
  }

  // If slate time is provided, show time until slate
  if (slateTime) {
    const slateDate = new Date(slateTime);
    const minutesToSlate = Math.floor((slateDate.getTime() - now.getTime()) / (1000 * 60));

    if (minutesToSlate > 0 && minutesToSlate < 60) {
      variant = 'destructive';
      timeDisplay += ` (${minutesToSlate}m to slate)`;
    } else if (minutesToSlate > 0 && minutesToSlate < 180) {
      variant = 'secondary';
      timeDisplay += ` (${Math.floor(minutesToSlate / 60)}h to slate)`;
    }
  }

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {timeDisplay}
    </Badge>
  );
}