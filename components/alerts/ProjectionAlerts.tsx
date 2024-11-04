'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingUp, TrendingDown, Twitter, MessageCircle, Brain } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'reddit';
  author: string;
  content: string;
  sentiment: number;
  timestamp: string;
  verified?: boolean;
  engagement: number;
}

interface Alert {
  id: number;
  playerName: string;
  oldProjection: number;
  newProjection: number;
  percentageChange: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  timestamp: number;
  relatedPosts: SocialPost[];
  aiSummary: string;
}

export function ProjectionAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [expandedAlerts, setExpandedAlerts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/alerts');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        const data = await response.json();
        setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const toggleAlert = (alertId: number) => {
    setExpandedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      CRITICAL: 'bg-red-500',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-blue-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const renderSocialPost = (post: SocialPost) => (
    <div key={post.id} className="p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {post.platform === 'twitter' ? (
          <Twitter className="w-4 h-4 text-blue-400" />
        ) : (
          <MessageCircle className="w-4 h-4 text-orange-400" />
        )}
        <span className="font-medium">{post.author}</span>
        {post.verified && (
          <Badge variant="secondary" className="text-xs">Verified</Badge>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {post.timestamp}
        </span>
      </div>
      <p className="text-sm">{post.content}</p>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <Badge variant={post.sentiment > 0 ? "success" : "destructive"}>
          {post.sentiment > 0 ? 'Positive' : 'Negative'}
        </Badge>
        <span>• {post.engagement} engagements</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Projection Alerts
          </CardTitle>
          {alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                No recent projection changes
              </p>
            ) : (
              alerts.map((alert) => (
                <Collapsible
                  key={alert.id}
                  open={expandedAlerts.includes(alert.id)}
                  onOpenChange={() => toggleAlert(alert.id)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50">
                        {alert.newProjection > alert.oldProjection ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{alert.playerName}</span>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.oldProjection.toFixed(1)} → {alert.newProjection.toFixed(1)} 
                            ({(alert.percentageChange * 100).toFixed(1)}% change)
                          </p>
                          <p className="text-sm mt-1">{alert.reason}</p>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <Tabs defaultValue="summary">
                          <TabsList className="w-full">
                            <TabsTrigger value="summary" className="flex-1">
                              <Brain className="w-4 h-4 mr-2" />
                              AI Summary
                            </TabsTrigger>
                            <TabsTrigger value="social" className="flex-1">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Social Posts
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="summary" className="mt-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <p className="text-sm">{alert.aiSummary}</p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="social" className="mt-4">
                            <div className="space-y-3">
                              {alert.relatedPosts.map(renderSocialPost)}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}