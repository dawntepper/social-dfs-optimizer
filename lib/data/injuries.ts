import { Injury } from '../types/injuries';

export const currentInjuries: Injury[] = [
  {
    player: "Rashee Rice",
    team: "KC",
    position: "WR",
    status: "O",
    type: "Leg",
    impactRating: 10
  },
  {
    player: "Christian McCaffrey",
    team: "SFO",
    position: "RB",
    status: "O",
    type: "Calf",
    impactRating: 10
  },
  {
    player: "Isiah Pacheco",
    team: "KCC",
    position: "RB",
    status: "O",
    type: "Ankle",
    impactRating: 10
  },
  {
    player: "Tua Tagovailoa",
    team: "MIA",
    position: "QB",
    status: "P",
    type: "Concussion",
    impactRating: 10
  },
  {
    player: "Tyreek Hill",
    team: "MIA",
    position: "WR",
    status: "Q",
    type: "Foot",
    impactRating: 10
  },
  // Add more injuries as needed...
];