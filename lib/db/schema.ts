// Type definitions for our database schema
export interface ProjectionAlert {
  id?: string;
  playerId: string;
  playerName: string;
  timestamp: number;
  oldProjection: number;
  newProjection: number;
  percentageChange: number;
  severity: string;
  reason: string;
  confidence: number;
  relatedPosts: string;
  aiSummary: string;
}

export interface SocialSentiment {
  id?: string;
  playerId: string;
  timestamp: number;
  source: string;
  sentiment: number;
  confidence: number;
  mentionCount: number;
  beatWriterSentiment?: number;
  trendingScore?: number;
}

export interface WeatherData {
  id?: string;
  gameId: string;
  timestamp: number;
  temperature?: number;
  windSpeed?: number;
  precipitation?: number;
  isIndoors: boolean;
}

export interface VegasOdds {
  id?: string;
  gameId: string;
  timestamp: number;
  total: number;
  spread: number;
  homeTeamTotal: number;
  awayTeamTotal: number;
}

// Table names
export const projectionAlerts = 'projection_alerts';
export const socialSentiments = 'social_sentiments';
export const weatherData = 'weather_data';
export const vegasOdds = 'vegas_odds';