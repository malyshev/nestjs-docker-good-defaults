import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
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
        // Pino logging module - uses merged config via ConfigService
        LoggerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const loggingConfig = configService.get<AppConfig['logging']>('logging');
                if (!loggingConfig) {
                    throw new Error('Logging configuration not found. Ensure ConfigModule is properly configured.');
                }

                return {
                    // Base Pino configuration - works for all NestJS app types (HTTP, microservices, workers, etc.)
                    pinoHttp: {
                        level: loggingConfig.level,
                        // Transport for pretty printing (development only)
                        // Production uses structured JSON (compatible with Promtail/Loki)
                        transport: loggingConfig.prettyPrint
                            ? {
                                  target: 'pino-pretty',
                                  options: {
                                      singleLine: false,
                                      colorize: true,
                                  },
                              }
                            : undefined,
                        // Disable auto HTTP request logging - can be added via interceptor later if needed
                        autoLogging: false,
                    },
                };
            },
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
