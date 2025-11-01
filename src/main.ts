import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import type { AppConfig } from './config/types/configuration.interface';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    // Get ConfigService instance
    const configService = app.get(ConfigService);
    const appConfig = configService.getOrThrow<AppConfig['app']>('app');
    const corsConfig = configService.getOrThrow<AppConfig['cors']>('cors');
    const helmetConfig = configService.getOrThrow<AppConfig['helmet']>('helmet');

    // Apply security middleware - uses merged config via ConfigService
    // Config is required - app will fail to start if missing (secure by default)
    app.use(helmet(helmetConfig));
    app.enableCors(corsConfig);

    // Start application on configured port
    await app.listen(appConfig.port);
}

bootstrap().catch((error: Error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
