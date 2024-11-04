'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { LineupAnalysis } from '@/components/analyze/LineupAnalysis';
import { UpgradePrompt } from '@/components/analyze/UpgradePrompt';
import { FileUploader } from '@/components/analyze/FileUploader';
import { LineupSkeleton } from '@/components/analyze/LineupSkeleton';

export default function AnalyzePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [lineups, setLineups] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileUpload = async (file: File) => {
    setAnalyzing(true);
    try {
      // Process CSV file
      const content = await file.text();
      const parsedLineups = parseCSV(content);
      setLineups(parsedLineups);
      
      // Perform analysis
      const results = await analyzeLineups(parsedLineups);
      setAnalysis(results);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const parseCSV = (content: string) => {
    // Basic CSV parsing for now - will be enhanced
    const lines = content.split('\n');
    const headers = lines[0].toLowerCase().split(',');
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, i) => {
          obj[header] = values[i];
          return obj;
        }, {});
      });
  };

  const analyzeLineups = async (lineups: any[]) => {
    // Mock analysis for now - will be connected to real analysis service
    return {
      score: 85,
      insights: [
        'Good correlation in stack combinations',
        'Consider diversifying QB exposure',
        'Weather concerns in 2 games'
      ],
      recommendations: [
        'Optimize for projected ownership',
        'Add contrarian stacks',
        'Review injury updates'
      ]
    };
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Lineup Analyzer</h1>

      {!lineups.length ? (
        <FileUploader onUpload={handleFileUpload} />
      ) : (
        <div className="space-y-6">
          {analyzing ? (
            <div className="space-y-4">
              <LineupSkeleton />
              <LineupSkeleton />
              <LineupSkeleton />
            </div>
          ) : (
            <>
              <LineupAnalysis lineups={lineups} analysis={analysis} />
              <UpgradePrompt />
            </>
          )}
        </div>
      )}
    </div>
  );
}