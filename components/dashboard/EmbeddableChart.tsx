'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, Code } from 'lucide-react';
import { useState } from 'react';

interface EmbeddableChartProps {
  children: React.ReactNode;
  title: string;
  height?: string;
  width?: string;
}

export function EmbeddableChart({ 
  children, 
  title,
  height = '400px',
  width = '100%'
}: EmbeddableChartProps) {
  const [showCode, setShowCode] = useState(false);

  const getEmbedCode = () => {
    const iframe = `<iframe
  src="${window.location.origin}/embed/chart/${encodeURIComponent(title)}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
></iframe>`;

    return iframe;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmbedCode());
    // Show toast notification
  };

  return (
    <Card className="relative">
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCode(!showCode)}
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
        >
          <Clipboard className="w-4 h-4" />
        </Button>
      </div>

      {showCode && (
        <div className="absolute top-12 right-2 z-20 bg-background border rounded-md p-4 shadow-lg">
          <pre className="text-sm">
            <code>{getEmbedCode()}</code>
          </pre>
        </div>
      )}

      {children}
    </Card>
  );
}