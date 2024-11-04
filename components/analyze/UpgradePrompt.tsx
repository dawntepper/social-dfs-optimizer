'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';

export function UpgradePrompt() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <Badge className="bg-primary/20">24 Hour Access</Badge>
            <h3 className="text-lg font-semibold">Quick Optimization</h3>
            <p className="text-sm text-muted-foreground">
              Perfect for last-minute lineup adjustments
            </p>
            <Button variant="outline" className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              $4.99
            </Button>
          </div>

          <div className="space-y-4">
            <Badge className="bg-primary/20">3 Day Pass</Badge>
            <h3 className="text-lg font-semibold">Extended Access</h3>
            <p className="text-sm text-muted-foreground">
              Build and optimize multiple lineups
            </p>
            <Button variant="outline" className="w-full">
              <Zap className="w-4 h-4 mr-2" />
              $9.99
            </Button>
          </div>

          <div className="space-y-4">
            <Badge className="bg-primary/20">Weekly Pass</Badge>
            <h3 className="text-lg font-semibold">Full Features</h3>
            <p className="text-sm text-muted-foreground">
              Complete access to all tools and features
            </p>
            <Button variant="default" className="w-full">
              <Zap className="w-4 h-4 mr-2" />
              $19.99
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}