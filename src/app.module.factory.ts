import { ConfigService } from '@nestjs/config';
import type { AppConfig, PinoHttpConfig } from './config/types/configuration.interface';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Factory function for LoggerModule configuration.
 *
 * @param configService - NestJS ConfigService instance
 * @returns LoggerModule configuration
 * @throws Error if logging configuration is missing
 */
export const loggerModuleFactory = (configService: ConfigService) => {
    const loggingConfig = configService.get<AppConfig['logging']>('logging');
    if (!loggingConfig) {
        throw new Error('Logging configuration not found. Ensure ConfigModule is properly configured.');
    }

    const pinoHttpConfig: PinoHttpConfig = {
        level: loggingConfig.level,
        autoLogging: false,
    };

    if (loggingConfig.prettyPrint) {
        pinoHttpConfig.transport = {
            target: 'pino-pretty',
            options: {
                singleLine: false,
                colorize: true,
            },
        };
    }

    return {
        pinoHttp: pinoHttpConfig,
    };
};

/**
 * Factory function for ThrottlerModule configuration.
 *
 * @param configService - NestJS ConfigService instance
 * @returns ThrottlerModule configuration
 * @throws Error if throttle configuration is missing
 */
export const throttlerModuleFactory = (configService: ConfigService): ThrottlerModuleOptions => {
    const throttle = configService.get<AppConfig['throttle']>('throttle');
    if (!throttle) {
        throw new Error('Throttle configuration not found. Ensure ConfigModule is properly configured.');
    }
    return throttle;
};
