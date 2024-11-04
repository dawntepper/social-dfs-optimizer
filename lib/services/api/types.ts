export interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  isIndoors: boolean;
}

export interface VegasOdds {
  total: number;
  spread: number;
  homeTeamTotal: number;
  awayTeamTotal: number;
  moneyline: {
    home: number;
    away: number;
  };
}

export interface AIAnalysis {
  sentiment: number;
  confidence: number;
  insights: string[];
  projectionAdjustment: number;
  riskFactors: Array<{
    type: string;
    impact: number;
    description: string;
  }>;
}

export interface ESPNGameStats {
  passingYards?: number;
  passingTDs?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
}

export interface ESPNPlayerStats {
  lastFiveGames: ESPNGameStats[];
  seasonStats: {
    gamesPlayed: number;
    totalPoints: number;
    avgPoints: number;
  };
}