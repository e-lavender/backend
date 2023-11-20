import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './configuration';
import * as Joi from 'joi';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [getConfiguration],
  validationSchema: Joi.object({
    USERS_SERVICES_PORT: Joi.number().required(),
    SALT_GENERATE_ROUND: Joi.number().required(),
    GMAIL: Joi.string().required(),
    GMAIL_PASS: Joi.string().required(),
    DOMAIN: Joi.string().required(),
    FRONT_DOMAIN: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    POSTGRES_DIRECT_URL: Joi.string().required(),
    POSTGRES_URL: Joi.string().required(),
  }),
});
