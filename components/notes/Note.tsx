'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';

export function Note() {
  const [noteText, setNoteText] = useState('');

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote 
            className={`h-4 w-4 ${
              noteText.trim() ? 'text-primary' : 'text-muted-foreground'
            }`} 
          />
          <span className="text-sm font-medium">Notes</span>
        </div>
        <Textarea
          placeholder="Add your notes here..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="min-h-[100px]"
        />
      </CardContent>
    </Card>
  );
}