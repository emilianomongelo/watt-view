import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiTokenGuard } from './auth/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const apiTokenGuard = app.get(ApiTokenGuard);
  app.useGlobalGuards(apiTokenGuard);

  const config = new DocumentBuilder()
    .setTitle('Watt View API')
    .setDescription('Solar energy monitoring system for Growatt SPF 5000 ES')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('status', 'System status — solar, weather, Growatt data')
    .addTag('solar', 'Solar position calculations (suncalc)')
    .addTag('weather', 'Weather data from Open-Meteo')
    .addTag('readings', 'Historical readings from PostgreSQL')
    .addTag('chat', 'AI chat with LLM')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
