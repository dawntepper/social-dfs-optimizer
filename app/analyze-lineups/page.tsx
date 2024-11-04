'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineupAnalysis } from '@/components/analyze-lineups/LineupAnalysis';
import { LineupUploader } from '@/components/analyze-lineups/LineupUploader';
import { LineupSkeleton } from '@/components/analyze-lineups/LineupSkeleton';
import { useToast } from '@/components/ui/use-toast';
import { aiService } from '@/lib/services/ai/AIService';

export default function AnalyzeLineupsPage() {
  const [lineups, setLineups] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  // Load saved lineups on mount
  useEffect(() => {
    const savedLineups = localStorage.getItem('generatedLineups');
    const savedAnalysis = localStorage.getItem('lineupAnalysis');
    
    if (savedLineups) {
      const parsedLineups = JSON.parse(savedLineups);
      setLineups(parsedLineups);
      analyzeLineups(parsedLineups);
    }
    if (savedAnalysis) {
      setAnalysis(JSON.parse(savedAnalysis));
    }
  }, []);

  const analyzeLineups = async (lineupsToAnalyze: any[]) => {
    setAnalyzing(true);
    try {
      const aiAnalysis = await aiService.analyzeLineups(lineupsToAnalyze);
      setAnalysis(aiAnalysis);
      
      // Save to localStorage
      localStorage.setItem('lineupAnalysis', JSON.stringify(aiAnalysis));
      
      toast({
        title: "Analysis complete",
        description: `Successfully analyzed ${lineupsToAnalyze.length} lineups`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze lineups. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (uploadedLineups: any[]) => {
    setLineups(uploadedLineups);
    analyzeLineups(uploadedLineups);
  };

  const clearSavedLineups = () => {
    localStorage.removeItem('generatedLineups');
    localStorage.removeItem('lineupAnalysis');
    setLineups([]);
    setAnalysis(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Lineup Analysis</h1>
        {lineups.length > 0 && (
          <Button 
            variant="outline" 
            onClick={clearSavedLineups}
          >
            Clear Lineups
          </Button>
        )}
      </div>

      {!lineups.length ? (
        <LineupUploader onUpload={handleFileUpload} />
      ) : (
        <div className="space-y-6">
          {analyzing ? (
            <div className="space-y-4">
              <LineupSkeleton />
              <LineupSkeleton />
              <LineupSkeleton />
            </div>
          ) : (
            <LineupAnalysis lineups={lineups} analysis={analysis} />
          )}
        </div>
      )}
    </div>
  );
}