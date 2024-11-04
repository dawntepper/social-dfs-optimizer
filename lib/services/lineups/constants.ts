```typescript
import { ContestConfig } from './types';

export const CONTEST_CONFIGS: Record<string, ContestConfig> = {
  'large-field': {
    type: 'large-field',
    maxOwnership: 25,
    minOwnership: 5,
    maxExposure: 35,
    salaryRemaining: {
      min: 200,
      max: 700
    },
    stacks: {
      correlationThreshold: 0.6,
      requireBringback: true,
      maxStackSize: 3,
      minStackSize: 2
    }
  },
  'mid-size': {
    type: 'mid-size',
    maxOwnership: 30,
    minOwnership: 10,
    maxExposure: 40,
    salaryRemaining: {
      min: 0,
      max: 400
    },
    stacks: {
      correlationThreshold: 0.5,
      requireBringback: false,
      maxStackSize: 2,
      minStackSize: 1
    }
  },
  'small-field': {
    type: 'small-field',
    maxOwnership: 40,
    minOwnership: 0,
    maxExposure: 50,
    salaryRemaining: {
      min: 0,
      max: 200
    },
    stacks: {
      correlationThreshold: 0.4,
      requireBringback: false,
      maxStackSize: 2,
      minStackSize: 1
    }
  },
  'cash': {
    type: 'cash',
    maxOwnership: 100,
    minOwnership: 0,
    maxExposure: 100,
    salaryRemaining: {
      min: 0,
      max: 0
    },
    stacks: {
      correlationThreshold: 0,
      requireBringback: false,
      maxStackSize: 0,
      minStackSize: 0
    }
  }
};

export const POSITION_CORRELATIONS: Record<string, Record<string, number>> = {
  QB: {
    WR: 0.6,
    TE: 0.4,
    RB: 0.1
  },
  RB: {
    DEF: 0.3,
    WR: -0.1
  },
  WR: {
    WR: 0.2,
    TE: 0.1
  },
  TE: {
    WR: 0.1
  }
};
```