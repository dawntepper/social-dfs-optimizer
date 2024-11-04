'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface AlertFiltersProps {
  onFilter: (filters: any) => void;
  slateTime?: string; // e.g., "2024-01-21T13:00:00" for 1pm slate
}

export function AlertFilters({ onFilter, slateTime }: AlertFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    severity: 'all',
    timeRange: 'all',
    date: null as Date | null,
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update active filters
    const active = Object.entries(newFilters)
      .filter(([k, v]) => v && v !== 'all')
      .map(([k]) => k);
    setActiveFilters(active);
    
    onFilter(newFilters);
  };

  const clearFilter = (key: string) => {
    handleFilterChange(key, key === 'date' ? null : 'all');
  };

  const getTimeRangeOptions = () => {
    const options = [
      { value: 'all', label: 'All Time' },
      { value: '1h', label: 'Last Hour' },
      { value: '4h', label: 'Last 4 Hours' },
      { value: '24h', label: 'Last 24 Hours' }
    ];

    if (slateTime) {
      const slateDate = new Date(slateTime);
      const now = new Date();
      const hoursToSlate = (slateDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursToSlate > 0 && hoursToSlate < 24) {
        options.push({ 
          value: 'slate', 
          label: `Until ${format(slateDate, 'h:mm a')} Slate` 
        });
      }
    }

    return options;
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search alerts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>

            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="projection">Projection Changes</SelectItem>
                <SelectItem value="social">Social Updates</SelectItem>
                <SelectItem value="weather">Weather Alerts</SelectItem>
                <SelectItem value="injury">Injury Updates</SelectItem>
                <SelectItem value="ownership">Ownership Changes</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity}
              onValueChange={(value) => handleFilterChange('severity', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.timeRange}
              onValueChange={(value) => handleFilterChange('timeRange', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                {getTimeRangeOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date ? format(filters.date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => handleFilterChange('date', date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary">
                  {filter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2"
                    onClick={() => clearFilter(filter)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({
                    search: '',
                    type: 'all',
                    severity: 'all',
                    timeRange: 'all',
                    date: null,
                  });
                  setActiveFilters([]);
                  onFilter({});
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}