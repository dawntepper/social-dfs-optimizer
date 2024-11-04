import { 
  BaseStats, 
  GameEnvironment, 
  ProjectionResult, 
  SocialMetrics 
} from '@/lib/types/projections';
import { calculateBaseProjection } from './baseProjections';
import { calculateWeatherImpact } from './weatherImpact';
import { calculateSocialImpact } from './socialImpact';
import { calculateVegasImpact } from './vegasImpact';

export function generateProjection(
  baseStats: BaseStats,
  environment: GameEnvironment,
  socialMetrics: SocialMetrics,
  position: string
): ProjectionResult {
  // Calculate base projection
  const baseProjection = calculateBaseProjection(baseStats);

  // Calculate modifiers
  const weatherModifier = calculateWeatherImpact(environment.weather);
  const vegasModifier = calculateVegasImpact(
    environment.vegasTeamTotal,
    environment.spread,
    position
  );
  const socialModifier = calculateSocialImpact(socialMetrics);

  // Calculate final projection with modifiers
  const modifiedProjection = baseProjection * weatherModifier * vegasModifier * socialModifier;

  // Calculate ceiling and floor
  const volatility = calculateVolatility(position, baseStats);
  const ceiling = modifiedProjection * (1 + volatility);
  const floor = modifiedProjection * (1 - volatility);

  // Calculate confidence score (0-1)
  const confidence = calculateConfidence(
    environment,
    socialMetrics,
    position
  );

  return {
    baseProjection,
    modifiedProjection,
    ceiling,
    floor,
    confidence,
    modifiers: {
      weather: weatherModifier,
      vegas: vegasModifier,
      social: socialModifier,
      historical: 1, // To be implemented
      gameScript: 1, // To be implemented
      defense: 1, // To be implemented
    }
  };
}

function calculateVolatility(position: string, stats: BaseStats): number {
  // Position-based volatility
  const baseVolatility = {
    QB: 0.25,
    RB: 0.30,
    WR: 0.35,
    TE: 0.40,
    DST: 0.45
  }[position] || 0.30;

  // Adjust based on usage
  let usageMultiplier = 1;
  if (position === 'WR' || position === 'TE') {
    usageMultiplier = stats.targets ? Math.min(stats.targets / 8, 1.2) : 1;
  } else if (position === 'RB') {
    usageMultiplier = stats.carries ? Math.min(stats.carries / 15, 1.2) : 1;
  }

  return baseVolatility * usageMultiplier;
}

function calculateConfidence(
  environment: GameEnvironment,
  socialMetrics: SocialMetrics,
  position: string
): number {
  let confidence = 0.7; // Base confidence

  // Weather impact on confidence
  if (environment.weather.isIndoors) {
    confidence += 0.1;
  } else if (environment.weather.windSpeed > 20 || environment.weather.precipitation > 0) {
    confidence -= 0.15;
  }

  // Social metrics impact
  if (Math.abs(socialMetrics.beatWriterSentiment) > 0.8) {
    confidence += 0.1 * Math.sign(socialMetrics.beatWriterSentiment);
  }

  // Vegas impact
  if (environment.vegasTeamTotal > 27) {
    confidence += 0.1;
  } else if (environment.vegasTeamTotal < 17) {
    confidence -= 0.1;
  }

  return Math.max(0, Math.min(1, confidence));
}