export interface BaseStats {
  passingYards?: number;
  passingTDs?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
  targets?: number;
  carries?: number;
  redZoneTargets?: number;
  redZoneCarries?: number;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  isIndoors: boolean;
}

export interface SocialMetrics {
  sentimentScore: number; // -1 to 1
  mentionCount: number;
  beatWriterSentiment: number; // -1 to 1
  recentNewsImpact: number; // -1 to 1
  trendingScore: number; // 0 to 1
}

export interface GameEnvironment {
  weather: WeatherData;
  vegasTotal: number;
  vegasTeamTotal: number;
  spread: number;
  homeGame: boolean;
  turf: boolean;
}

export interface ProjectionModifiers {
  weather: number;
  vegas: number;
  social: number;
  historical: number;
  gameScript: number;
  defense: number;
}

export interface ProjectionResult {
  baseProjection: number;
  modifiedProjection: number;
  ceiling: number;
  floor: number;
  confidence: number;
  modifiers: ProjectionModifiers;
}