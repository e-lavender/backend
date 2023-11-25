import { AuthGuard } from '@nestjs/passport';

export class JwtAccessAuthGuard extends AuthGuard('jwt-access') {}
