'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { slateService } from '@/lib/services/dfs/SlateDataService';
import Link from 'next/link';

interface CorrelationMatrixProps {
  selectedTeam: string;
}

interface CorrelationData {
  position: string;
  correlations: { [key: string]: number };
}

export default function CorrelationMatrix({ selectedTeam }: CorrelationMatrixProps) {
  // ... rest of the imports and interface definitions ...

  const getCorrelationColor = (value: number) => {
    const normalizedValue = (value + 1) / 2;
    const opacity = Math.abs(value) * 0.4; // Reduced opacity for softer colors
    if (value > 0) {
      return `rgba(34, 197, 94, ${opacity})`; // Softer green
    } else if (value < 0) {
      return `rgba(239, 68, 68, ${opacity})`; // Softer red
    }
    return 'rgba(100, 116, 139, 0.1)'; // Very soft gray
  };

  const getTextColor = (value: number) => {
    return Math.abs(value) > 0.5 ? 'text-foreground font-medium' : 'text-muted-foreground';
  };

  // ... rest of the component implementation ...
}