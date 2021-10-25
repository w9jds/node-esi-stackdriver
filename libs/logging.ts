import { Log, Logging, LoggingOptions } from '@google-cloud/logging';
import { LogEntry, LogSeverity } from '@google-cloud/logging/build/src/entry';
import { Response } from 'node-fetch';

type Resource = {
  type?: string;
  labels?: Record<string, string>
}

export default class Logger {
  private logger: Log;
  private resource: Resource = {
    type: 'container',
    labels: {
      cluster_name: 'new-eden-webapi',
      container_name: this.name,
      namespace_id: 'default'
    }
  };

  constructor(private name: string, options: LoggingOptions) {
    const logging = new Logging(options);

    this.resource.labels.project_id = options.projectId;
    this.logger = logging.log(this.name);
  }

  public log = async (severity: LogSeverity, labels: Record<string, string>, content): Promise<any> => {
    let metadata: LogEntry = {
      resource: this.resource,
      severity,
      labels
    };

    return this.logger.write(this.logger.entry(metadata, content));
  }

  public logHttp = async (method: string, response: Response, body: any): Promise<any> => {
    if (!(response.status >= 200 && response.status < 300)) {
      let metadata: LogEntry = {
        severity: 500,
        resource: this.resource,
        httpRequest: {
          requestUrl: response.url,
          status: response.status,
          requestMethod: method
        }
      };

      return this.logger.write(
        this.logger.entry(metadata, {
          headers: response.headers ? JSON.stringify(response.headers.raw()) : '',
          body
        })
      );
    }
  }
}