'use client';

import { useState } from 'react';
import { Brain, Info, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || credits <= 0) return;

    setLoading(true);
    try {
      // API call would go here
      setCredits((prev) => prev - 1);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-primary",
          isOpen && "hidden"
        )}
      >
        <Brain className="h-6 w-6" />
      </Button>

      <Card className={cn(
        "fixed bottom-4 right-4 w-[400px] h-[600px] shadow-lg flex flex-col",
        !isOpen && "hidden"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {credits} AI credits
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-primary hover:text-primary/80" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[300px] p-4">
                  <p className="font-medium mb-2">About AI Credits</p>
                  <ul className="space-y-2 text-sm">
                    <li>• 1 credit = 1 AI question or analysis request</li>
                    <li>• Credits are used per question, regardless of length</li>
                    <li>• Complex analysis may require multiple credits</li>
                    <li>• Credits refresh monthly based on your plan</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat messages would go here */}
        </div>

        <div className="p-4 border-t">
          {credits > 0 ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any question (uses 1 AI credit)"
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Out of AI credits
              </p>
              <Button variant="outline" size="sm">
                Get More AI Credits
              </Button>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}