import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config/configuration';
import { loggerModuleFactory, throttlerModuleFactory } from './app.module.factory';

@Module({
    imports: [
        // Configuration module - explicit import required (not global)
        ConfigModule.forRoot({
            load: [configuration],
            envFilePath: ['.env.local', '.env'],
        }),
        // Pino logging module - imports ConfigModule to use ConfigService
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: loggerModuleFactory,
        }),
        // Rate limiting configuration - imports ConfigModule to use ConfigService
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: throttlerModuleFactory,
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
