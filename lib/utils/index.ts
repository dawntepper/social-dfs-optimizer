import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateProjectedPoints(stats: any): number {
  const points = {
    passingYards: 0.04,
    passingTouchdowns: 4,
    passingInterceptions: -1,
    rushingYards: 0.1,
    rushingTouchdowns: 6,
    receivingYards: 0.1,
    receivingTouchdowns: 6,
    receptions: 1, // PPR scoring
    fumblesLost: -2
  };

  let total = 0;

  // Passing
  total += (stats.passingYards || 0) * points.passingYards;
  total += (stats.passingTouchdowns || 0) * points.passingTouchdowns;
  total += (stats.passingInterceptions || 0) * points.passingInterceptions;

  // Rushing
  total += (stats.rushingYards || 0) * points.rushingYards;
  total += (stats.rushingTouchdowns || 0) * points.rushingTouchdowns;

  // Receiving
  total += (stats.receivingYards || 0) * points.receivingYards;
  total += (stats.receivingTouchdowns || 0) * points.receivingTouchdowns;
  total += (stats.receptions || 0) * points.receptions;

  // Miscellaneous
  total += (stats.fumblesLost || 0) * points.fumblesLost;

  return Number(total.toFixed(2));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatPoints(points: number): string {
  return points.toFixed(1);
}

export function getPositionColor(position: string): string {
  const colors = {
    QB: 'text-red-500',
    RB: 'text-blue-500',
    WR: 'text-green-500',
    TE: 'text-purple-500',
    DST: 'text-orange-500'
  };
  return colors[position] || 'text-gray-500';
}

export function getValueTier(value: number): string {
  if (value >= 3) return 'text-green-500';
  if (value >= 2) return 'text-blue-500';
  if (value >= 1) return 'text-yellow-500';
  return 'text-red-500';
}

export function calculateValue(salary: number, points: number): number {
  return Number(((points * 1000) / salary).toFixed(2));
}