import * as Logging from '@google-cloud/logging';
import { Severity, Metadata, StackdriverOptions } from '../models/Log';
import {Response} from 'node-fetch'

export default class Logger {
    private logger;
    private resource = {
        type: 'container',
        labels: {
            cluster_name: 'chingy-webapi',
            container_name: this.name,
            namespace_id: 'default'
        }
    };

    constructor(private name: string, options: StackdriverOptions) {
        const logging = new Logging({ 
            projectId: options.projectId 
        });

        // this.resource = {
        //     type: '',
        //     labels: {
        //         project_id: options.projectId
        //     }
        // }

        this.logger = logging.log(this.name);
    }

    public log = async (severity: Severity, labels: {[key:string]: string}, content): Promise<any> => {
        let metadata: Metadata = {
            resource: this.resource,
            severity,
            labels
        };

        return this.logger.write(this.logger.entry(metadata, content));
    }

    public logHttp = async (method: string, response: Response, body: any): Promise<any> => {
        if (!(response.status >= 200 && response.status < 300)) {
            let metadata: Metadata = {
                severity: Severity.ERROR,
                resource: this.resource,
                httpRequest: {
                    requestUrl: response.url,
                    status: response.status,
                    requestMethod: method
                }
            };
        
            return this.logger.write(
                this.logger.entry(metadata, {
                    headers: response.headers,
                    body
                })
            );
        }
    }
}