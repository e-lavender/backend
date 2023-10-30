import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './configuration';
import * as Joi from 'joi';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [getConfiguration],
  validationSchema: Joi.object({
    USERS_SERVICES_PORT: Joi.number().required(),
  }),
});
