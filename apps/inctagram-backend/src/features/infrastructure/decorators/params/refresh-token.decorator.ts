import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshToken } from '../../../../../../../libs/types';

export const RefreshTokenPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext): RefreshToken => {
    const request = context.switchToHttp().getRequest();
    if (request.user) {
      return {
        deviceId: request.user.deviceId,
        iat: request.user.iat,
      };
    }
  },
);
