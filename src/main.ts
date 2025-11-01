import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import helmet from 'helmet';
import type { AppConfig } from './config/types/configuration.interface';

async function bootstrap(): Promise<void> {
    // Create app with buffered logs - logs are buffered until logger is ready
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true, // Buffer logs until Pino logger is ready
    });

    const logger = app.get(Logger);

    // Use Pino logger - replaces default NestJS logger
    app.useLogger(logger);

    // Get ConfigService instance
    const configService = app.get(ConfigService);
    const appConfig = configService.getOrThrow<AppConfig['app']>('app');
    const corsConfig = configService.getOrThrow<AppConfig['cors']>('cors');
    const helmetConfig = configService.getOrThrow<AppConfig['helmet']>('helmet');

    // Apply security middleware - uses merged config via ConfigService
    // Config is required - the app will fail to start if missing (secure by default)
    app.use(helmet(helmetConfig));
    app.enableCors(corsConfig);

    // Start application on configured port
    await app.listen(appConfig.port);

    // Log application startup with accessible URL
    const appLink = `http://localhost:${appConfig.port}`;
    logger.log(`Application started at ${appLink}`);
}

bootstrap().catch((error: Error) => {
    // Use console.error as fallback if logger initialization fails
    console.error('Failed to start application:', error);
    process.exit(1);
});
