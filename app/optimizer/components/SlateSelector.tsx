'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { slateService } from '@/lib/services/dfs/SlateDataService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SlateSelectorProps {
  onSlateDownloaded: (content: string, site: 'draftkings' | 'fanduel') => void;
}

export default function SlateSelector({ onSlateDownloaded }: SlateSelectorProps) {
  const [site, setSite] = useState<'draftkings' | 'fanduel'>('draftkings');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPlayers, setHasPlayers] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();

  // Check if there are players in the pool
  useEffect(() => {
    const slateContent = localStorage.getItem('current_slate');
    if (slateContent) {
      try {
        slateService.loadSlateData(slateContent);
        const players = slateService.getPlayerPool();
        setHasPlayers(players.length > 0);
        // If there are players, collapse by default
        setIsOpen(!players.length);
      } catch (error) {
        console.error('Error checking player pool:', error);
        setHasPlayers(false);
        setIsOpen(true);
      }
    } else {
      setHasPlayers(false);
      setIsOpen(true);
    }
  }, []);

  const validateCSV = (content: string): { valid: boolean; error?: string } => {
    try {
      const lines = content.trim().split('\n');
      
      if (lines.length < 2) {
        return { valid: false, error: 'File appears to be empty or invalid' };
      }

      const headers = lines[0].toLowerCase().split(',');
      const requiredFields = ['name', 'position', 'salary', 'team'];
      const missingFields = requiredFields.filter(field => 
        !headers.some(h => h.includes(field))
      );

      if (missingFields.length > 0) {
        return { 
          valid: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        };
      }

      // Validate each line has the correct number of columns
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',');
        if (columns.length !== headers.length) {
          return { 
            valid: false, 
            error: `Invalid data format in line ${i + 1}. Expected ${headers.length} columns but found ${columns.length}.` 
          };
        }

        // Validate salary is a number
        const salaryIdx = headers.findIndex(h => h.includes('salary'));
        const salary = columns[salaryIdx]?.replace(/[^0-9.-]/g, '');
        if (!salary || isNaN(Number(salary))) {
          return { valid: false, error: `Invalid salary in line ${i + 1}` };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to parse CSV file. Please check the file format.' };
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setLoading(true);

      const file = event.target.files?.[0];
      if (!file) {
        throw new Error('Please select a file to upload');
      }

      // Validate file type
      if (!file.name.endsWith('.csv')) {
        throw new Error('Only CSV files are supported');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      // Read and validate file content
      const content = await file.text();
      const validation = validateCSV(content);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Load the slate data
      slateService.loadSlateData(content);
      
      // Store in localStorage
      localStorage.setItem('current_slate', content);
      
      // Notify parent component
      onSlateDownloaded(content, site);

      const playerCount = slateService.getPlayerPool().length;
      setHasPlayers(playerCount > 0);
      
      toast({
        title: 'Success',
        description: `Successfully loaded ${playerCount} players`,
      });

      // Reset file input
      event.target.value = '';

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process file';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      // Reset file input on error
      if (event.target) {
        event.target.value = '';
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center justify-between">
            <CardTitle>{hasPlayers ? 'Update Player List' : 'Upload Player List'}</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-4">
                <Button
                  variant={site === 'draftkings' ? 'default' : 'outline'}
                  onClick={() => setSite('draftkings')}
                  disabled={loading}
                >
                  DraftKings
                </Button>
                <Button
                  variant={site === 'fanduel' ? 'default' : 'outline'}
                  onClick={() => setSite('fanduel')}
                  disabled={loading}
                >
                  FanDuel
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="w-full max-w-md">
                <label 
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    loading 
                      ? 'bg-muted cursor-not-allowed' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-8 h-8 mb-2 text-muted-foreground ${
                      loading ? 'animate-pulse' : ''
                    }`} />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">
                        {loading ? 'Processing...' : hasPlayers ? 'Click to update' : 'Click to upload'}
                      </span>
                      {!loading && ' or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CSV files only (max 5MB)
                    </p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Required columns:</p>
                <ul className="list-disc list-inside">
                  <li>Name</li>
                  <li>Position</li>
                  <li>Salary</li>
                  <li>Team</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}