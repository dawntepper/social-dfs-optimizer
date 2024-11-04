import { BaseStats, ProjectionResult } from '@/lib/types/projections';

const POINTS = {
  passingYard: 0.04,
  passingTD: 4,
  rushingYard: 0.1,
  rushingTD: 6,
  reception: 1, // PPR
  receivingYard: 0.1,
  receivingTD: 6
};

export function calculateBaseProjection(stats: BaseStats): number {
  let points = 0;

  // Passing
  if (stats.passingYards) {
    points += stats.passingYards * POINTS.passingYard;
  }
  if (stats.passingTDs) {
    points += stats.passingTDs * POINTS.passingTD;
  }

  // Rushing
  if (stats.rushingYards) {
    points += stats.rushingYards * POINTS.rushingYard;
  }
  if (stats.rushingTDs) {
    points += stats.rushingTDs * POINTS.rushingTD;
  }

  // Receiving
  if (stats.receptions) {
    points += stats.receptions * POINTS.reception;
  }
  if (stats.receivingYards) {
    points += stats.receivingYards * POINTS.receivingYard;
  }
  if (stats.receivingTDs) {
    points += stats.receivingTDs * POINTS.receivingTD;
  }

  return points;
}