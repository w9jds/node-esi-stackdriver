import * as bluebird from 'bluebird';
import * as fs from 'fs';
import fetch, { Response } from 'node-fetch';

import Logger from './logging';
import {Severity, StackdriverOptions} from '../models/Log';
import {Character, Location, Ship, Online, Affiliation, Roles, Titles, Title} from '../models/Character';
import {Region, Type, Group, Reference} from '../models/Universe';
import {Group as MarketGroup} from '../models/Market';
import {Server, Status} from '../models/Server';

const basePath = 'https://esi.tech.ccp.is';

export interface ErrorResponse {
    error: boolean;
    statusCode: number;
    uri: string;
}

export default class Esi {
    private headers = { 'Accept': 'application/json' };
    private server: Server;
    private logger: Logger;

    constructor(userAgent: string, options: StackdriverOptions, server = Server.TRANQUILITY) {
        this.server = server != Server.TRANQUILITY ? server : Server.TRANQUILITY;
        this.headers['User-Agent'] = userAgent;

        this.logger =  new Logger('esi', options);
    }

    public verifyResponse = async (method: string, response: Response): Promise<any | ErrorResponse> => {    
        if (response.status >= 200 && response.status < 305) {
            if (response.body) {
                return await response.json();
            }
            return;
        }

        await this.logger.logHttp(method, response, await response.text());
        
        return {
            error: true,
            statusCode: response.status,
            uri: response.url
        }
    }

    private get = async (uri: string, auth?: string) => {
        try {
            const response: Response = await fetch(uri, {
                method: 'GET',
                headers: {
                    'Authorization': auth,
                    ...this.headers
                }
            });

            if (response.headers.has('X-Pages')) {
                return await this.getAllPages(response);
            }

            return await this.verifyResponse('GET', response);
        }
        catch(error) {
            return await this.errorHandler(error, uri);
        }
    }

    private getAllPages = async (response: Response) => {
        const pageSize = parseInt(response.headers.get('X-Pages'));

        const types = await bluebird
            .map([...Array(pageSize).keys()], page => {
                return fetch(`${response.url}&page=${page + 1}`);
            })
            .map((response: Response) => {
                return this.verifyResponse('GET', response);
            });

        return [].concat.apply([], types);
    }

    private post = async (uri: string, body: Object, auth?: string) => {
        try {
            const response: Response = await fetch(uri, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json',
                    ...this.headers
                }
            });
            
            return await this.verifyResponse('POST', response);
        }
        catch(error) {
            return await this.errorHandler(error, uri);
        }
    }

    private errorHandler = async (error, uri): Promise<ErrorResponse> => {
        await this.logger.log(Severity.ERROR, {}, error);
        return {
            error: true, 
            statusCode: 500,
            uri
        };
    }

    public search = async (query: string): Promise<any | ErrorResponse> => 
        await this.get(`${basePath}/latest/search/?categories=alliance%2Ccharacter%2Ccorporation&datasource=${this.server}&language=en-us&search=${query}&strict=false`);
    
    public getNames = async (ids: string[] | number[]): Promise<Reference[] | ErrorResponse> =>
        await this.post(`${basePath}/v2/universe/names/?datasource=${this.server}`, ids)
    
    public status = async (): Promise<Status | ErrorResponse> => 
        await this.get(`${basePath}/latest/status/?datasource=${this.server}`);
    
    /** Characters **/

    public getCharacter = async (id: string): Promise<any | ErrorResponse> => 
        await this.get(`${basePath}/latest/characters/${id}/?datasource=${this.server}`);
    
    public getCharacterOnline = async (character: Character): Promise<Online | ErrorResponse> => {
        const content = await this.get(
            `${basePath}/v2/characters/${character.id}/online/?datasource=${this.server}`, 
            `Bearer ${character.sso.accessToken}`
        );

        return {
            id: character.id,
            ...content
        };
    }
    
    public getCharacterLocation = async (character: Character): Promise<Location | ErrorResponse> => {
        const content = await this.get(
            `${basePath}/latest/characters/${character.id}/location/?datasource=${this.server}`,
            `Bearer ${character.sso.accessToken}`
        );

        return {
            id: character.id,
            ...content
        };
    }
    
    public getCharacterShip = async (character: Character): Promise<Ship | ErrorResponse> => {
        const content = await this.get(
            `${basePath}/latest/characters/${character.id}/ship/?datasource=${this.server}`,
            `Bearer ${character.sso.accessToken}`
        );

        return {
            id: character.id,
            ...content
        };
    }
    
    public getCharacterRoles = async (id: string, accessToken: string): Promise<Roles | ErrorResponse> => {
        const content = await this.get(
            `${basePath}/v2/characters/${id}/roles/?datasource=${this.server}`,
            `Bearer ${accessToken}`
        );

        if (!content.error) {
            return {
                id,
                ...content
            };
        }

        return content;
    }

    public getCharacterTitles = async (id: number, accessToken: string): Promise<Titles | ErrorResponse> => {
        const content = await this.get(
            `${basePath}/v1/characters/${id}/titles/?datasource=${this.server}`,
            `Bearer ${accessToken}`
        );

        if (content instanceof Array) {
            return {
                id,
                titles: content
            };
        }

        return content;
    }

    public getAffiliations = async (characterIds: string[] | number[]): Promise<Affiliation[] | ErrorResponse> =>
        await this.post(`${basePath}/v1/characters/affiliation/?datasource=${this.server}`, characterIds)
    
    /** Corporations */

    

    /** Market */

    public getGroups = async (): Promise<number[] | ErrorResponse> => 
        await this.get(`${basePath}/v1/markets/groups/?datasource=${this.server}`)

    public getGroupItems = async (groupId: string | number): Promise<MarketGroup | ErrorResponse> => 
        await this.get(`${basePath}/v1/markets/groups/${groupId}/?datasource=${this.server}`)
    
    /** Universe */

    public getSystemKills = async (): Promise<any | ErrorResponse> => 
        await this.get(`${basePath}/v1/universe/system_jumps/?datasource=${this.server}`);

    public getSystemJumps = async (): Promise<any | ErrorResponse> => 
        await this.get(`${basePath}/v2/universe/system_kills/?datasource=${this.server}`);

    public getRoute = async (origin: string | number, destination: string | number, flag: string): Promise<any | ErrorResponse> =>
        await this.get(`${basePath}/latest/route/${origin}/${destination}/?flag=${flag}`);

    public getRegions = async (): Promise<number[] | ErrorResponse> =>
        await this.get(`${basePath}/v1/universe/regions/?datasource=${this.server}`);
    
    public getRegion = async (regionId: string | number): Promise<Region | ErrorResponse> => 
        await this.get(`${basePath}/v1/universe/regions/${regionId}/?datasource=${this.server}`);

    public getTypes = async (): Promise<number[] | ErrorResponse> =>
        await this.get(`${basePath}/v1/universe/types/?datasource=${this.server}`);
 
    public getType = async (typeId: string | number): Promise<Type | ErrorResponse> => 
        await this.get(`${basePath}/v3/universe/types/${typeId}/?datasource=${this.server}`);

    public getUniverseGroups = async (): Promise<number[] | ErrorResponse> => 
        await this.get(`${basePath}/v1/universe/groups/?datasource=${this.server}`);

    public getUniverseGroup = async (groupId: string | number): Promise<Group | ErrorResponse> => 
        await this.get(`${basePath}/v1/universe/groups/${groupId}/?datasource=${this.server}`);

    /** UI */

    public setWaypoint = async (character: Character, location, setType): Promise<Response> => {    
        const response: Response = await fetch(`${basePath}/latest/ui/autopilot/waypoint/?add_to_beginning=${setType.isFirst}&clear_other_waypoints=${setType.clear}&destination_id=${location.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${character.sso.accessToken}`,
                ...this.headers
            }
        });
    
        return response;
    }

    public getKillmail = async (id: string | number, hash: string): Promise<any | ErrorResponse> => 
        await this.get(`${basePath}/v1/killmails/${id}/${hash}/?datasource=${this.server}`);

}
