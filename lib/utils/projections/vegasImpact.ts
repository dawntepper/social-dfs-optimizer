export function calculateVegasImpact(
  teamTotal: number,
  spread: number,
  position: string
): number {
  let modifier = 1;

  // Team total impact
  if (teamTotal >= 27) {
    modifier *= 1.05; // High-scoring environment boost
  } else if (teamTotal <= 17) {
    modifier *= 0.95; // Low-scoring environment penalty
  }

  // Spread impact based on position
  if (position === 'RB') {
    if (spread > 7) {
      modifier *= 1.08; // Positive game script for RBs
    } else if (spread < -7) {
      modifier *= 0.92; // Negative game script for RBs
    }
  } else if (position === 'WR' || position === 'TE') {
    if (spread < -7) {
      modifier *= 1.05; // Passing game boost when trailing
    }
  }

  return modifier;
}