import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './infra/logger/pino-logger.config';
import { RestLoggingInterceptor } from './infra/logger/rest-logger.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
    rawBody: true,
  });

  const configService = app.get<ConfigService>(ConfigService);
  app.use(cookieParser());

  if (configService.get<string>('NODE_ENV') === 'production') {
    const users = {};
    users[configService.get<string>('SWAGGER_USERNAME')] =
      configService.get<string>('SWAGGER_PASSWORD');
    app.use(
      ['/api', '/api-json'],
      basicAuth({
        challenge: true,
        users,
      }),
    );
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pentillo backend')
    .setDescription('Backend for Pentillo')
    .addBearerAuth()
    .addCookieAuth('Authentication')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      requestInterceptor: (req) => {
        req.credentials = 'include';
        return req;
      },
    },
  });

  app.use(helmet());
  app.useGlobalInterceptors(new RestLoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  await app.listen(configService.get<number>('PORT'));
}

bootstrap();
