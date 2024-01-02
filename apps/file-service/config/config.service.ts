import { Injectable } from '@nestjs/common';
import { ConfigService as DefaultConfigServices } from '@nestjs/config';
import { ConfigType } from './configuration';

@Injectable()
export class GlobalConfigService {
  constructor(
    private defaultConfigServices: DefaultConfigServices<ConfigType>,
  ) {}

  getConnectionData(service: string): { host: string; port: number } {
    let port = Number(
      this.defaultConfigServices.get('services', {
        infer: true,
      })[service].port,
    );
    if (isNaN(port)) {
      port = 3000;
    }

    const host = this.defaultConfigServices.get('services', {
      infer: true,
    })[service]?.host;

    return { host, port };
  }
}
