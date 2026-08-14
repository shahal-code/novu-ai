import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS matching original express settings
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://novuai.vercel.app'],
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('NovuAI Backend API')
    .setDescription('Production-ready Clean Architecture NestJS REST API for NovuAI')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 5000);
  await app.listen(port);
  logger.log(`🚀 NovuAI NestJS Clean Architecture Backend running on http://localhost:${port}`);
  logger.log(`📑 Swagger Documentation available on http://localhost:${port}/api/docs`);
}

bootstrap();
