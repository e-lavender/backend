import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GlobalConfigService } from '../../../config/config.service';

@Injectable()
export class JwtRefreshAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: GlobalConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getJwtSecret(),
    });
  }

  async validate(payload: { userId: string; deviceId: string; iat: string }) {
    return { id: payload.userId, deviceId: payload.deviceId, iat: payload.iat };
  }
}
