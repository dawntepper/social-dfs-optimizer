import { WeatherData } from '@/lib/types/projections';

export function calculateWeatherImpact(weather: WeatherData): number {
  let modifier = 1;

  // Temperature impact
  if (weather.temperature < 32) {
    modifier *= 0.95; // Cold weather penalty
  } else if (weather.temperature > 90) {
    modifier *= 0.97; // Hot weather penalty
  }

  // Wind impact (particularly on passing)
  if (weather.windSpeed > 15) {
    modifier *= 0.93;
  } else if (weather.windSpeed > 20) {
    modifier *= 0.88;
  }

  // Precipitation impact
  if (weather.precipitation > 0) {
    modifier *= 0.92;
  }

  // Indoor bonus
  if (weather.isIndoors) {
    modifier = 1.02; // Slight boost for controlled conditions
  }

  return modifier;
}