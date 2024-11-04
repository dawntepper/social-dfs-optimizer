export interface Injury {
  player: string;
  team: string;
  position: string;
  status: 'O' | 'Q' | 'D' | 'P';
  type: string;
  impactRating: number;
}

export const InjuryStatuses = {
  O: 'Out',
  Q: 'Questionable',
  D: 'Doubtful',
  P: 'Probable'
} as const;

export const getStatusColor = (status: keyof typeof InjuryStatuses) => {
  switch (status) {
    case 'O':
      return 'bg-red-500';
    case 'Q':
      return 'bg-yellow-500';
    case 'D':
      return 'bg-orange-500';
    case 'P':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const getImpactColor = (rating: number) => {
  if (rating >= 8) return 'text-red-500';
  if (rating >= 6) return 'text-orange-500';
  if (rating >= 4) return 'text-yellow-500';
  return 'text-green-500';
};