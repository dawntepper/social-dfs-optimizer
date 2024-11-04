'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TwitterIcon, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Tweet {
  id: string;
  text: string;
  sentiment: number;
  author: string;
  verified: boolean;
  timestamp: string;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

interface TwitterFeedProps {
  tweets: Tweet[];
  loading?: boolean;
}

export function TwitterFeed({ tweets, loading = false }: TwitterFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <Card key={tweet.id} className="p-4">
            <div className="flex items-start gap-3">
              <TwitterIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tweet.author}</span>
                    {tweet.verified && (
                      <Badge variant="secondary">Verified</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {tweet.timestamp}
                  </span>
                </div>
                <p className="text-sm">{tweet.text}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {tweet.sentiment > 0 ? (
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                    )}
                    <span>
                      Sentiment: {tweet.sentiment > 0 ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{tweet.metrics.retweets} retweets</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}