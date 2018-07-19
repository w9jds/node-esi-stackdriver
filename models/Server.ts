export enum Server {
    TRANQUILITY = 'tranquility',
    SINGULARITY = 'singularity'
}

export interface Status {
    start_time: string;
    players: number;
    server_version: string;
    vip?: boolean;
}