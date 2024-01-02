import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './configuration';
import * as Joi from 'joi';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [getConfiguration],
  validationSchema: Joi.object({
    FILE_SERVICE_HOST: Joi.string().required(),
    FILE_SERVICE_PORT: Joi.number().required(),
    MONGODB_URL: Joi.string().required(),
  }),
});
