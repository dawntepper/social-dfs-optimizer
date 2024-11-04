'use client';

import { useState } from 'react';
import { Stack } from '@/lib/types/dfs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StackItem } from './StackItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StackListProps {
  stacks: Stack[];
  onRemoveStack?: (index: number) => void;
  onAddToLineups?: (stackId: string, percentage: number) => void;
  error?: string | null;
}

const ITEMS_PER_PAGE = 5;

export function StackList({ stacks, onRemoveStack, onAddToLineups, error }: StackListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'correlation' | 'points' | 'leverage'>('correlation');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [percentages, setPercentages] = useState<Record<string, number>>({});

  // Get unique teams from stacks
  const teams = Array.from(new Set(stacks.map(stack => stack.team))).sort();

  // Filter stacks
  const filteredStacks = stacks.filter(stack => 
    filterTeam === 'all' || stack.team === filterTeam
  );

  // Sort stacks
  const sortedStacks = [...filteredStacks].sort((a, b) => {
    switch (sortBy) {
      case 'correlation':
        return b.correlation - a.correlation;
      case 'points':
        return b.projectedPoints - a.projectedPoints;
      case 'leverage':
        return b.leverageScore - a.leverageScore;
      default:
        return 0;
    }
  });

  // Paginate stacks
  const totalPages = Math.ceil(sortedStacks.length / ITEMS_PER_PAGE);
  const paginatedStacks = sortedStacks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePercentageChange = (stackId: string, value: string) => {
    const percentage = Math.min(100, Math.max(0, parseInt(value) || 0));
    setPercentages(prev => ({ ...prev, [stackId]: percentage }));
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stacks.length) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No stacks available. Please ensure player data is loaded.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map(team => (
              <SelectItem key={team} value={team}>{team}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="correlation">Correlation</SelectItem>
            <SelectItem value="points">Projected Points</SelectItem>
            <SelectItem value="leverage">Leverage Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {paginatedStacks.map((stack, index) => (
            <div key={stack.id || index} className="space-y-2">
              <StackItem 
                stack={stack}
                onRemove={onRemoveStack ? () => onRemoveStack(index) : undefined}
              />
              {onAddToLineups && (
                <div className="flex items-center gap-2 px-4">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter %"
                    value={percentages[stack.id] || ''}
                    onChange={(e) => handlePercentageChange(stack.id, e.target.value)}
                    className="w-24"
                  />
                  <Button
                    size="sm"
                    onClick={() => onAddToLineups(stack.id, percentages[stack.id] || 0)}
                    disabled={!percentages[stack.id]}
                  >
                    Add to Lineups
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}