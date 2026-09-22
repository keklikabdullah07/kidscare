import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
const DEFAULT_PROD_ORIGINS = [
    'https://kidscare-web.onrender.com',
    'https://kidscare-api.onrender.com',
];
function resolveAllowedOrigins() {
    const env = process.env.CORS_ALLOWED_ORIGINS;
    if (env && env.trim().length > 0) {
        if (env.trim() === '*')
            return true;
        return env
            .split(',')
            .map((o) => o.trim())
            .filter((o) => o.length > 0);
    }
    if (process.env.NODE_ENV === 'production') {
        return (origin, callback) => {
            if (!origin)
                return callback(null, true);
            try {
                const url = new URL(origin);
                if (DEFAULT_PROD_ORIGINS.includes(origin) ||
                    url.hostname.endsWith('.vercel.app') ||
                    url.hostname === 'localhost' ||
                    url.hostname === '127.0.0.1') {
                    return callback(null, true);
                }
            }
            catch {
                // invalid url, reject
            }
            return callback(null, false);
        };
    }
    return true;
}
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.set('trust proxy', 1);
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
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
