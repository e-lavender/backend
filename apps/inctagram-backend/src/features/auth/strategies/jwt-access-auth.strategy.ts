import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GlobalConfigService } from '../../../config/config.service';

@Injectable()
export class JwtAccessAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private configService: GlobalConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getJwtSecret(),
    });
  }

  async validate(payload: any) {
    return { id: payload.userId };
  }
}
