export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent: string;
  salary: number;
  projectedPoints: number;
  ownership?: number;
  gameTime?: string;
  isLocked?: boolean;
  isExcluded?: boolean;
  value?: number;
  ceiling?: number;
  floor?: number;
  socialMetrics?: {
    sentiment: number;
    beatWriterSentiment: number;
    trendingScore: number;
    insights: string[];
  };
}

export interface Stack {
  id: string;
  team: string;
  positions: string[];
  correlation: number;
  lineupPercentage: number;
  players: Player[];
  required?: boolean;
}

export interface Slate {
  id: string;
  name: string;
  site: 'draftkings' | 'fanduel';
  startTime: Date;
  createdAt: Date;
  updatedAt: Date;
}