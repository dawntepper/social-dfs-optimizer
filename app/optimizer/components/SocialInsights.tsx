'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Twitter, MessageCircle, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Player } from '@/lib/types/dfs';

interface SocialInsightsProps {
  player?: Player;
  insights: Array<{
    source: 'twitter' | 'reddit';
    author: string;
    content: string;
    sentiment: number;
    timestamp: string;
    verified?: boolean;
    engagement: number;
  }>;
}

export default function SocialInsights({ player, insights }: SocialInsightsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (sentiment < -0.2) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle>Social Insights</CardTitle>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {insight.source === 'twitter' ? (
                          <Twitter className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        ) : (
                          <MessageCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                        )}
                        <div className="space-y-2 w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{insight.author}</span>
                              {insight.verified && (
                                <Badge variant="secondary">Verified</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {insight.timestamp}
                            </span>
                          </div>
                          <p className="text-sm">{insight.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {getSentimentIcon(insight.sentiment)}
                              <span>
                                {insight.sentiment > 0 ? 'Positive' : insight.sentiment < 0 ? 'Negative' : 'Neutral'}
                              </span>
                            </div>
                            <span>• {insight.engagement} engagements</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}