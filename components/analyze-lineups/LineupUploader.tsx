'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LineupUploaderProps {
  onUpload: (lineups: any[]) => void;
}

export function LineupUploader({ onUpload }: LineupUploaderProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].toLowerCase().split(',');
    
    // Track unique contest names per lineup
    const lineupContests = new Map<string, Set<string>>();
    
    const lineups = lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = line.split(',');
        const lineup: any = {};
        
        // Get contest name
        const contestNameIdx = headers.findIndex(h => h.includes('contest name'));
        if (contestNameIdx >= 0) {
          const contestName = values[contestNameIdx].trim();
          if (!lineupContests.has(index.toString())) {
            lineupContests.set(index.toString(), new Set());
          }
          lineupContests.get(index.toString())?.add(contestName);
        }

        // Parse player positions
        headers.forEach((header, i) => {
          if (['qb', 'rb', 'wr', 'te', 'flex', 'dst'].includes(header)) {
            const playerName = values[i].split('(')[0].trim();
            lineup[header.toUpperCase()] = playerName;
          }
        });

        // Add mock data for demo
        lineup.players = Object.entries(lineup)
          .filter(([key]) => !['contestNames'].includes(key))
          .map(([pos, name]) => ({
            position: pos,
            name,
            ownership: Math.random() * 20,
            salary: Math.floor(Math.random() * 3000) + 4000,
            projection: Math.random() * 15 + 10
          }));

        lineup.totalSalary = lineup.players.reduce((sum: number, p: any) => sum + p.salary, 0);
        lineup.totalOwnership = lineup.players.reduce((sum: number, p: any) => sum + p.ownership, 0) / lineup.players.length;
        lineup.totalProjection = lineup.players.reduce((sum: number, p: any) => sum + p.projection, 0);
        lineup.score = Math.floor(Math.random() * 20) + 80;
        lineup.projectionThreshold90 = 20; // Mock 90th percentile threshold

        // Convert Set of contest names to array
        lineup.contestNames = Array.from(lineupContests.get(index.toString()) || []);
        if (lineup.contestNames.length === 0) {
          lineup.contestNames = ['NFL Contest']; // Default contest name
        }

        return lineup;
      });

    return lineups;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const lineups = parseCSV(text);
      onUpload(lineups);
      
      toast({
        title: "Success",
        description: `Loaded ${lineups.length} lineups for analysis`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse lineup file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center p-8">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="lineup-upload"
          />
          <label htmlFor="lineup-upload" className="block cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Upload Lineups</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Upload your DraftKings or FanDuel lineups CSV file to analyze ownership and correlations
                </p>
              </div>
              <Button variant="outline" disabled={loading}>
                {loading ? 'Processing...' : 'Select CSV File'}
              </Button>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}