import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface CorrelationMatrixProps {
  data?: {
    labels: string[];
    values: number[][];
  };
}

export function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const mockData = {
    labels: ['QB', 'RB', 'WR', 'TE', 'DST'],
    values: [
      [1.0, 0.3, 0.6, 0.2, -0.1],
      [0.3, 1.0, 0.2, 0.1, 0.0],
      [0.6, 0.2, 1.0, 0.3, -0.2],
      [0.2, 0.1, 0.3, 1.0, -0.1],
      [-0.1, 0.0, -0.2, -0.1, 1.0],
    ],
  };

  const matrixData = data || mockData;

  const getCorrelationColor = (value: number) => {
    const normalizedValue = (value + 1) / 2;
    const hue = normalizedValue * 120;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Position Correlation Matrix</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Shows how different positions correlate in scoring.</p>
              <p>1.0 = perfect correlation, -1.0 = inverse correlation</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2"></th>
                {matrixData.labels.map((label, index) => (
                  <th key={`header-${label}-${index}`} className="p-2 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.labels.map((rowLabel, i) => (
                <tr key={`row-${rowLabel}-${i}`}>
                  <td className="p-2 font-medium">{rowLabel}</td>
                  {matrixData.values[i].map((value, j) => (
                    <td
                      key={`cell-${i}-${j}`}
                      className="p-2 text-center"
                      style={{
                        backgroundColor: getCorrelationColor(value),
                        color: value > 0.5 ? 'white' : 'inherit',
                      }}
                    >
                      {value.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}