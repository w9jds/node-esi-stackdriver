export interface Character {
    id: number;
    name: string;
    accountId: string;
    allianceId?: number;
    corpId?: number;
    hash: string;
    sso?: Permissions;
}

export interface Permissions {
    accessToken: string;
    refreshToken: string;
    scope?: string;
    expiresAt: number;
}

export interface Roles {
    id?: number;
    roles: any[];
    roles_at_base: any[];
    roles_at_hq: any[];
    roles_at_other: any[];
}

export interface Titles {
    id?: number;
    titles: Title[];
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