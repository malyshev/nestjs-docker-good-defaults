import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config/configuration';
import type { AppConfig } from './config/types/configuration.interface';

@Module({
    imports: [
        // Configuration module - loads .env files and merges with environment-specific configs
        ConfigModule.forRoot({
            isGlobal: true, // Make ConfigService available globally
            load: [configuration], // Load merged configuration
            envFilePath: ['.env.local', '.env'], // Load .env files in order
        }),
        // Rate limiting configuration - uses merged config via ConfigService
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
                const throttle = configService.get<AppConfig['throttle']>('throttle');
                if (!throttle) {
                    throw new Error('Throttle configuration not found. Ensure ConfigModule is properly configured.');
                }
                return throttle;
            },
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Apply throttler guard globally
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
