import { Injectable } from '@nestjs/common';
import { ConfigService as DefaultConfigServices } from '@nestjs/config';
import { ConfigType } from './configuration';

@Injectable()
export class GlobalConfigService {
  constructor(
    private defaultConfigServices: DefaultConfigServices<ConfigType>,
  ) {}

  getPort(service: string) {
    const port = Number(
      this.defaultConfigServices.get('services', {
        infer: true,
      })[service].port,
    );
    if (isNaN(port)) {
      return 3000;
    }
    return port;
  }
}
