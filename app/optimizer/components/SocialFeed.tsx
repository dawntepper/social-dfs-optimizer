'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Twitter } from 'lucide-react';

export default function SocialFeed() {
  const mockTweets = [
    {
      id: '1',
      author: 'NFL Beat Writer',
      handle: '@NFLInsider',
      content: 'Patrick Mahomes looking sharp in practice today. Expect a big game against Raiders secondary.',
      time: '2h ago',
      sentiment: 'positive',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Twitter className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Social Feed</h3>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {mockTweets.map((tweet) => (
            <Card key={tweet.id} className="bg-muted/50">
              <CardHeader className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-semibold">{tweet.author}</CardTitle>
                    <p className="text-xs text-muted-foreground">{tweet.handle}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{tweet.time}</span>
                </div>
              </CardHeader>
              <CardContent className="py-3">
                <p className="text-sm">{tweet.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}