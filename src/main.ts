import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;
  const origins = configService.get<string[]>('cors.origins') || ['http://localhost:3000'];

  // Security Headers (configured to allow cross-origin image requests)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Cookie Parser
  app.use(cookieParser());

  // CORS Configuration
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global DTO Validation & Transformation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global HTTP Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Response Envelope Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BLITZ Website API')
    .setDescription(
      'REST API for BLITZ, Department of Computer Science society at Keshav Mahavidyalaya, University of Delhi. Provides public content endpoints and authenticated administrative CRUD.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'bearer',
    )
    .addCookieAuth('blitz_token', {
      type: 'apiKey',
      in: 'cookie',
      description: 'Session cookie automatically set on login',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'BLITZ API Documentation',
  });

  await app.listen(port);
  logger.log(`BLITZ Backend is running on: http://localhost:${port}/api/v1`);
  logger.log(`API Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
