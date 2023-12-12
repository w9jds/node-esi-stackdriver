export enum SystemState {
  CAPTURED = 'captured',
  CONTESTED = 'contested',
  UNCONTESTED = 'uncontested',
  VULNERABLE = 'vulnerable',
}

export type WarfareSystem = {
  contested: SystemState;
  occupier_faction_id: number;
  owner_faction_id: number;
  solar_system_id: number;
  victory_points: number;
  victory_points_threshold: number;
}

export type WarfareStats = {
  faction_id: number;
  pilots: number;
  systems_controlled: number;
  victory_points: Statistics;
  kills: Statistics;
}

type Statistics = {
  last_week: number;
  total: number;
  yesterday: number;
}

export type War = {
  against_id: number;
  faction_id: number;
}
