import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './types/configuration.interface';
import { defaultConfig } from './default.config';
import { developmentConfig } from './development.config';
import { productionConfig } from './production.config';
import { testConfig } from './test.config';

/**
 * Configuration factory function for NestJS ConfigModule.
 *
 * This function combines:
 * 1. Environment variables (loaded from .env files)
 * 2. Environment-specific configuration files
 * 3. Default values
 *
 * The configuration is merged in this order:
 * 1. Default config (base values)
 * 2. Environment-specific config (overrides defaults)
 * 3. Environment variables (final overrides)
 *
 * This factory receives a ConfigService instance from NestJS ConfigModule,
 * which has access to all environment variables. The merged configuration
 * can then be accessed via ConfigService.get('app'), ConfigService.get('cors'), etc.
 *
 * @param configService - NestJS ConfigService instance with env vars (can be partial during load)
 * @returns Configuration object that can be injected via ConfigService
 */
export const configuration = (configService?: ConfigService): Record<string, unknown> => {
    // Create a temporary ConfigService if one is not provided (during load phase)
    // or use the provided one which has access to env vars
    const tempConfigService = configService || new ConfigService();

    const env = tempConfigService.get<string>('NODE_ENV', 'development');
    const baseConfig = defaultConfig(tempConfigService);

    // Get environment-specific config
    let envConfig: Partial<AppConfig> = {};
    switch (env) {
        case 'production':
            envConfig = productionConfig(tempConfigService);
            break;
        case 'test':
            envConfig = testConfig(tempConfigService);
            break;
        case 'development':
        default:
            envConfig = developmentConfig(tempConfigService);
            break;
    }

    // Merge configurations: default -> environment-specific -> env vars
    const mergedConfig: AppConfig = {
        app: { ...baseConfig.app, ...envConfig.app },
        cors: { ...baseConfig.cors, ...envConfig.cors },
        throttle: { ...baseConfig.throttle, ...envConfig.throttle },
        helmet: { ...baseConfig.helmet, ...envConfig.helmet },
        logging: { ...baseConfig.logging, ...envConfig.logging },
    };

    // Cast to Record<string, unknown> for NestJS ConfigModule compatibility
    return mergedConfig as unknown as Record<string, unknown>;
};
