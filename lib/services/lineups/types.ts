```typescript
export interface Player {
  id: string;
  name: string;
  pos: string;
  team: string;
  opponent: string;
  salary: number;
  projectedPoints: number;
  ownership?: number;
  value?: number;
  isSelected?: boolean;
  isExcluded?: boolean;
  minExposure?: number;
  maxExposure?: number;
}

export interface Stack {
  id: string;
  players: Player[];
  correlation: number;
  totalSalary: number;
  projectedPoints: number;
  leverageScore: number;
}

export interface StackConfig {
  correlationThreshold: number;
  requireBringback: boolean;
  maxStackSize: number;
  minStackSize: number;
}

export interface ContestConfig {
  type: 'large-field' | 'mid-size' | 'small-field' | 'cash';
  maxOwnership: number;
  minOwnership: number;
  maxExposure: number;
  salaryRemaining: {
    min: number;
    max: number;
  };
  stacks: StackConfig;
}
```