```typescript
export interface ContestRules {
  maxPlayerExposure: number;
  maxQBExposure: number;
  minLowOwnedPlayers: number;
  lowOwnedThreshold: number;
  salaryBuffer: { min: number; max: number };
  minGameEnvironments: number;
  stackRules: {
    qbStackSize: { min: number; max: number };
    requireBringback: boolean;
    minGameTotal: number;
  };
  correlationThresholds: {
    qbWr: number;
    qbTe: number;
    rbDef: number;
  };
}

export class ContestRulesService {
  getLargeFieldRules(): ContestRules {
    return {
      maxPlayerExposure: 25,
      maxQBExposure: 35,
      minLowOwnedPlayers: 1,
      lowOwnedThreshold: 5,
      salaryBuffer: { min: 200, max: 700 },
      minGameEnvironments: 3,
      stackRules: {
        qbStackSize: { min: 2, max: 3 },
        requireBringback: true,
        minGameTotal: 50
      },
      correlationThresholds: {
        qbWr: 0.6,
        qbTe: 0.5,
        rbDef: 0.3
      }
    };
  }

  getMidSizeRules(): ContestRules {
    return {
      maxPlayerExposure: 30,
      maxQBExposure: 40,
      minLowOwnedPlayers: 1,
      lowOwnedThreshold: 10,
      salaryBuffer: { min: 0, max: 400 },
      minGameEnvironments: 2,
      stackRules: {
        qbStackSize: { min: 1, max: 2 },
        requireBringback: false,
        minGameTotal: 45
      },
      correlationThresholds: {
        qbWr: 0.5,
        qbTe: 0.4,
        rbDef: 0.2
      }
    };
  }

  getSmallFieldRules(): ContestRules {
    return {
      maxPlayerExposure: 40,
      maxQBExposure: 50,
      minLowOwnedPlayers: 0,
      lowOwnedThreshold: 15,
      salaryBuffer: { min: 0, max: 200 },
      minGameEnvironments: 1,
      stackRules: {
        qbStackSize: { min: 1, max: 1 },
        requireBringback: false,
        minGameTotal: 40
      },
      correlationThresholds: {
        qbWr: 0.4,
        qbTe: 0.3,
        rbDef: 0.2
      }
    };
  }

  getCashGameRules(): ContestRules {
    return {
      maxPlayerExposure: 100,
      maxQBExposure: 100,
      minLowOwnedPlayers: 0,
      lowOwnedThreshold: 0,
      salaryBuffer: { min: 0, max: 0 },
      minGameEnvironments: 1,
      stackRules: {
        qbStackSize: { min: 0, max: 0 },
        requireBringback: false,
        minGameTotal: 0
      },
      correlationThresholds: {
        qbWr: 0,
        qbTe: 0,
        rbDef: 0
      }
    };
  }

  getRulesForContest(type: string): ContestRules {
    switch (type) {
      case 'large-field':
        return this.getLargeFieldRules();
      case 'mid-size':
        return this.getMidSizeRules();
      case 'small-field':
        return this.getSmallFieldRules();
      case 'cash':
        return this.getCashGameRules();
      default:
        return this.getMidSizeRules();
    }
  }
}

export const contestRules = new ContestRulesService();
```