import {AttributeId, EffectId} from './Dogma';

export enum Category {
  ALLIANCE = 'alliance',
  CHARACTER = 'character',
  CONSTELLATION = 'constellation',
  CORPORATION = 'corporation',
  INVENTORY_TYPE = 'inventory_type',
  REGION = 'region',
  SOLAR_SYSTEM = 'solar_system',
  STATION = 'station'
}

export enum Gender {
  FEMALE = 'female',
  MALE = 'male'
}

export interface Region {
  region_id: number;
  name: string;
  description?: string;
  constellations: number[];
}

export interface Group {
  groups_id: number;
  name: string;
  published: boolean;
  category_id: number;
  types: number[];
}

export interface Type {
  type_id: number;
  name: string;
  description: string;
  published: boolean;
  group_id: number;
  market_group_id?: number;
  radius?: number;
  volume?: number;
  packaged_volume?: number;
  icon_id?: number;
  capacity?: number;
  portion_size?: number;
  mass?: number;
  graphic_id?: number;
  dogma_attributes?: AttributeId[];
  dogma_effects?: EffectId[];
}

export interface Reference {
  id: number;
  name: string;
  category: Category
}

export interface Faction {
  corporation_id: number;
  description: string;
  faction_id: number;
  is_unique: boolean;
  militia_corporation_id: number;
  name: string;
  size_factor: number;
  solar_system_id: number;
  station_count: number;
  station_system_count: number;
}

export interface Character {
  name: string;
  description: string;
  corporation_id: number;
  alliance_id?: number;
  birthday: string;
  gender: Gender,
  race_id: number;
  bloodline_id: number;
  ancestry_id?: number;
  security_status?: number;
  faction_id?: number;
}

type Categories = 'agent' | 'alliance' | 'character' | 'constellation' | 'corporation' | 'faction' | 'inventory_type' | 'region' | 'solar_system' | 'station' | 'structure';

export type SearchParameters = {
  categories: Categories[];
  language?: string;
  search: string;
  strict?: boolean;
}

export type SearchResults = {
  agent: number[];
  alliance: number[];
  character: number[];
  constellation: number[];
  corporation: number[];
  faction: number[];
  inventory_type: number[];
  region: number[];
  solar_system: number[];
  station: number[];
  structure: number[];
}