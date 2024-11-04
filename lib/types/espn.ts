export interface ESPNPlayer {
  id: string;
  fullName: string;
  defaultPositionId: number;
  proTeamId: number;
  stats: ESPNStats[];
  injured: boolean;
  injuryStatus?: string;
}

export interface ESPNStats {
  seasonId: number;
  scoringPeriodId: number;
  statSourceId: number;
  stats: {
    [key: string]: number;
  };
  appliedTotal: number;
}

export interface ESPNTeam {
  id: number;
  abbrev: string;
  location: string;
  name: string;
  byeWeek: number;
}

// ESPN position IDs
export const ESPNPositions = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 4,
  K: 5,
  DST: 16
} as const;

// Mapping ESPN stats to our format
export const ESPNStatsMapping = {
  passingYards: '3',
  passingTouchdowns: '4',
  passingInterceptions: '20',
  rushingYards: '24',
  rushingTouchdowns: '25',
  receivingYards: '42',
  receivingTouchdowns: '43',
  receptions: '53',
  fumblesLost: '72'
} as const;