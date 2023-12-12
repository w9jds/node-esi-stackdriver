import { map } from 'bluebird';
import fetch, { Response } from 'node-fetch';
import { LoggingOptions } from '@google-cloud/logging';

import Logger from './logging';
import { Header, Mail } from '../models/Mails';
import { Character, Location, Ship, Online, Affiliation, Roles, Title, CorporationHistory, CharacterInfo } from '../models/Character';
import { Region, Type, Group, Reference } from '../models/Universe';
import { Group as MarketGroup, Order } from '../models/Market';
import { Server, Status } from '../models/Server';
import { SkillQueueItem, SkillsOverview } from '../models/Skills';
import { War, WarfareStats, WarfareSystem } from '../models/FactionWarfare';
import { AuthOptions } from '../models/Options';

const basePath = 'https://esi.evetech.net';

export interface ErrorResponse {
  error: boolean;
  statusCode: number;
  uri: string;
  content?: string;
}

export default class Esi {
  private headers = { 'Accept': 'application/json' };
  private server: Server;
  private logger: Logger;

  constructor(userAgent: string, options: LoggingOptions, server = Server.TRANQUILITY) {
    this.server = server != Server.TRANQUILITY ? server : Server.TRANQUILITY;
    this.headers['User-Agent'] = userAgent;

    this.logger = new Logger('esi', options);
  }

  public verifyResponse = async (method: string, response: Response): Promise<any | ErrorResponse> => {
    if ((response.status >= 200 && response.status < 300) || response.status == 305) {
      if (response.body) {
        return await response.json();
      }
      return;
    }

    const content = await response.text();
    await this.logger.logHttp(method, response, content);

    return {
      error: true,
      statusCode: response.status,
      uri: response.url,
      content
    };
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
    catch (error) {
      return await this.errorHandler(error, uri);
    }
  }

  private getAllPages = async (response: Response) => {
    const pageSize = parseInt(response.headers.get('X-Pages'));

    const types = await map([...Array(pageSize).keys()], page => {
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
    catch (error) {
      return await this.errorHandler(error, uri);
    }
  }

  private errorHandler = async (error, uri): Promise<ErrorResponse> => {
    await this.logger.log(500, {}, error).catch(ex => { console.error(ex) });
    return {
      uri,
      error: true,
      statusCode: 500,
      content: JSON.stringify(error)
    };
  }

  public getNames = async (ids: string[] | number[]): Promise<Reference[] | ErrorResponse> =>
    await this.post(`${basePath}/v3/universe/names/?datasource=${this.server}`, ids)

  public status = async (): Promise<Status | ErrorResponse> =>
    await this.get(`${basePath}/v2/status/?datasource=${this.server}`);

  /** Characters **/

  public getCharacter = async (id: string | number): Promise<CharacterInfo | ErrorResponse> =>
    await this.get(`${basePath}/v5/characters/${id}/?datasource=${this.server}`);

  public getCharacterOnline = async (options: Pick<AuthOptions, 'character'>): Promise<Online | ErrorResponse> => {
    const content = await this.get(
      `${basePath}/v3/characters/${options.character.id}/online/?datasource=${this.server}`,
      `Bearer ${options.character.sso.accessToken}`
    );

    return {
      id: options.character.id,
      ...content
    };
  }

  public getCharacterLocation = async (options: Pick<AuthOptions, 'character'>): Promise<Location | ErrorResponse> => {
    const content = await this.get(
      `${basePath}/v2/characters/${options.character.id}/location/?datasource=${this.server}`,
      `Bearer ${options.character.sso.accessToken}`
    );

    return {
      id: options.character.id,
      ...content
    };
  }

  public getCharacterShip = async (options: Pick<AuthOptions, 'character'>): Promise<Ship | ErrorResponse> => {
    const content = await this.get(
      `${basePath}/v2/characters/${options.character.id}/ship/?datasource=${this.server}`,
      `Bearer ${options.character.sso.accessToken}`
    );

    return {
      id: options.character.id,
      ...content
    };
  }

  public getCharacterRoles = async (id: string | number, accessToken: string): Promise<Roles | ErrorResponse> =>
    await this.get(`${basePath}/v3/characters/${id}/roles/?datasource=${this.server}`, `Bearer ${accessToken}`);

  public getCharacterTitles = async (id: string | number, accessToken: string): Promise<Title[] | ErrorResponse> =>
    await this.get(`${basePath}/v2/characters/${id}/titles/?datasource=${this.server}`, `Bearer ${accessToken}`)

  public getCharacterHistory = async (id: string | number, accessToken: string): Promise<CorporationHistory[] | ErrorResponse> =>
    await this.get(`${basePath}/v2/characters/${id}/corporationhistory/?datasource=${this.server}`, `Bearer ${accessToken}`);

  public getAffiliations = async (characterIds: string[] | number[]): Promise<Affiliation[] | ErrorResponse> =>
    await this.post(`${basePath}/v2/characters/affiliation/?datasource=${this.server}`, characterIds)

  /** Corporations */


  /** Skills */

  public getSkills = async (character: Character): Promise<SkillsOverview | ErrorResponse> =>
    await this.get(`${basePath}/v4/characters/${character.id}/skills/`, `Bearer ${character.sso.accessToken}`)

  public getSkillQueue = async (character: Character): Promise<SkillQueueItem[] | ErrorResponse> =>
    await this.get(`${basePath}/v2/characters/${character.id}/skillqueue/`, `Bearer ${character.sso.accessToken}`)


  /** Mail */

  public getMailHeaders = async (character: Character): Promise<Header[] | ErrorResponse> =>
    await this.get(`${basePath}/v1/characters/${character.id}/mail/`, `Bearer ${character.sso.accessToken}`)

  public getMail = async (character: Character, mailId: number | string): Promise<Mail | ErrorResponse> =>
    await this.get(`${basePath}/v1/characters/${character.id}/mail/${mailId}/`, `Bearer ${character.sso.accessToken}`)

  /** Market */

  public getGroups = async (): Promise<number[] | ErrorResponse> =>
    await this.get(`${basePath}/v1/markets/groups/?datasource=${this.server}`)

  public getGroupItems = async (groupId: string | number): Promise<MarketGroup | ErrorResponse> =>
    await this.get(`${basePath}/v1/markets/groups/${groupId}/?datasource=${this.server}`)

  public getRegionOrders = async (regionId: string | number, typeId: string | number): Promise<Order[] | ErrorResponse> =>
    await this.get(`${basePath}/v1/markets/${regionId}/orders/?type_id=${typeId}&datasource=${this.server}`)

  /** Faction Warfare */

  public getFwSystems = async (): Promise<WarfareSystem[] | ErrorResponse> =>
    await this.get(`${basePath}/v3/fw/systems?datasource=${this.server}`)

  public getFwStats = async (): Promise<WarfareStats[] | ErrorResponse> =>
    await this.get(`${basePath}/v2/fw/stats?datasource=${this.server}`)

  public getFactionWars = async (): Promise<War[] | ErrorResponse> =>
    await this.get(`${basePath}/v2/fw/wars/?datasource=${this.server}`)

  /** Universe */

  public getSystemKills = async (): Promise<any | ErrorResponse> =>
    await this.get(`${basePath}/v2/universe/system_kills/?datasource=${this.server}`);

  public getSystemJumps = async (): Promise<any | ErrorResponse> =>
    await this.get(`${basePath}/v1/universe/system_jumps/?datasource=${this.server}`);

  /**
   * @deprecated this endpoint doesn't get updated with new stargates/systems fast enough to be relevent
   */
  public getRoute = async (origin: string | number, destination: string | number, flag: string): Promise<any | ErrorResponse> =>
    await this.get(`${basePath}/v1/route/${origin}/${destination}/?flag=${flag}`);

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
    const response: Response = await fetch(`${basePath}/v2/ui/autopilot/waypoint/?add_to_beginning=${setType.isFirst}&clear_other_waypoints=${setType.clear}&destination_id=${location.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${character.sso.accessToken}`,
        ...this.headers
      }
    });

    return response;
  }

  public openInformation = async (character: Character, targetId: number): Promise<Response> => {
    const response: Response = await fetch(`${basePath}/v1/ui/openwindow/information?target_id=${targetId}&datasource=${this.server}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${character.sso.accessToken}`,
        ...this.headers,
      }
    });

    return response;
  }

  public getKillmail = async (id: string | number, hash: string): Promise<any | ErrorResponse> =>
    await this.get(`${basePath}/v1/killmails/${id}/${hash}/?datasource=${this.server}`);

}

