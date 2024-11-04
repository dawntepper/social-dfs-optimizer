'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RedditIcon, ArrowUpCircle, MessageCircle } from 'lucide-react';

interface RedditPost {
  id: string;
  title: string;
  text: string;
  sentiment: number;
  author: string;
  verified: boolean;
  subreddit: string;
  timestamp: string;
  metrics: {
    upvotes: number;
    comments: number;
  };
}

interface RedditFeedProps {
  posts: RedditPost[];
  loading?: boolean;
}

export function RedditFeed({ posts, loading = false }: RedditFeedProps) {
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
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex items-start gap-3">
              <RedditIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.title}</span>
                    <Badge variant="secondary">r/{post.subreddit}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {post.timestamp}
                  </span>
                </div>
                <p className="text-sm">{post.text}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>{post.metrics.upvotes} upvotes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.metrics.comments} comments</span>
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