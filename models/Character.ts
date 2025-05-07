export interface Character {
  id: number;
  name: string;
  accountId: string;
  allianceId?: number;
  corpId?: number;
  titles?: string[];
  hash: string;
  roles?: CharacterRoles;
  sso?: Permissions;
  memberFor?: number;
}

export interface CharacterInfo {
  alliance_id?: number;
  birthday: string;
  bloodline_id: number;
  corporation_id: number;
  description?:	string;
  faction_id?: number;
  gender:	'female' | 'male';
  name: string;
  race_id: number;
  security_status?: number;
  title?: string;
}

export interface CharacterRoles {
  roles?: string[];
  roles_at_hq?: string[];
  roles_at_other?: string[];
}

export interface Permissions {
  accessToken: string;
  refreshToken: string;
  scope?: string;
  expiresAt: number;
}

export interface Roles {
  roles: any[];
  roles_at_base: any[];
  roles_at_hq: any[];
  roles_at_other: any[];
}

export interface Title {
  title_id: number;
  name: string;
}

export interface Online {
  id?: number;
  online: boolean;
  last_login?: string;
  last_logout?: string;
  logins?: number;
}

export interface Location {
  id?: number;
  solar_system_id: number;
  station_id?: number;
  structure_id?: number;
}

export interface Ship {
  id?: number;
  ship_type_id: number;
  ship_item_id: number;
  ship_name: string;
}

export interface Affiliation {
  character_id: number;
  corporation_id: number;
  alliance_id?: number;
  faction_id?: number;
}

export interface CorporationHistory {
  corporation_id: number;
  is_deleted?: boolean;
  record_id: boolean;
  start_date: string;
}

export interface Alliance {
  creator_corporation_id: number;
  creator_id: number;
  date_founded: string;
  executor_corporation_id: number;
  faction_id: number;
  name:	string;
  ticker:	string;
}

export interface Corporation {
  alliance_id: number;
  ceo_id: number;
  creator_id: number;
  date_founded: string;
  description: string;
  faction_id: number;
  home_station_id: number;
  member_count: number;
  name: string;
  shares: number;
  tax_rate: number;
  ticker: string;
  url: string;
  war_eligible: boolean;
}