import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const operationIdFactory = (controllerKey: string, methodKey: string) =>
  `${methodKey}`;

export const setupSwagger = (app) => {
  const config = new DocumentBuilder()
    .setTitle('Inctagram(Flying Merch)')
    .setVersion('1.0')
    .addTag('Auth')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory,
  });
  SwaggerModule.setup('api/v1/swagger', app, document);
};
