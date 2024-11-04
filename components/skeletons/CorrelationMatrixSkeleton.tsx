'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CorrelationMatrixSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>

          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="grid grid-cols-6 gap-2">
              <Skeleton className="h-8 w-full" />
              {[1, 2, 3, 4, 5].map((col) => (
                <Skeleton key={col} className="h-8 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}