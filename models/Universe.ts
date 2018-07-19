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
