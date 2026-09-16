import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

const DEFAULT_PROD_ORIGINS = [
  'https://kidscare-web.onrender.com',
  'https://kidscare-api.onrender.com',
];

function resolveAllowedOrigins(): string[] | true {
  const env = process.env.CORS_ALLOWED_ORIGINS;
  if (env && env.trim().length > 0) {
    return env.split(',').map((o) => o.trim()).filter((o) => o.length > 0);
  }
  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PROD_ORIGINS;
  }
  return true;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors({
    origin: resolveAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder'],
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  Logger.log(`API listening on http://0.0.0.0:${port}`, 'Bootstrap');
}

void bootstrap();