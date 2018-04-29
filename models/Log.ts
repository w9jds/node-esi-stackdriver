export interface StackdriverOptions {
    projectId: string;
}

export interface HttpRequest {
    requestMethod: string,
    requestUrl: string,
    requestSize?: string,
    status: number,
    responseSize?: string,
    userAgent?: string,
    remoteIp?: string,
    serverIp?: string,
    referer?: string,
    latency?: string,
    cacheLookup?: boolean,
    cacheHit?: boolean,
    cacheValidatedWithOriginServer?: boolean,
    cacheFillBytes?: string,
    protocol?: string
}

export interface MonitoredResource {
    type: string,
    labels: {
      [key: string]: string,
    }
}

export interface Metadata {
    resource: MonitoredResource,
    timestamp?: string,
    receiveTimestamp?: string,
    severity: Severity,
    httpRequest?: HttpRequest,
    labels?: {
        [key: string]: string
    }
}

export enum Severity {
    DEFAULT = 0,
    DEBUG = 100,
    INFO = 200,
    NOTICE = 300,
    WARNING = 400,
    ERROR = 500,
    CRITICAL = 600,
    ALERT = 700,
    EMERGENCY = 800,
};
