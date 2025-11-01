import type { AppConfig } from './types/configuration.interface';
import type { ConfigService } from '@nestjs/config';

/**
 * Development environment configuration factory.
 *
 * Extends default configuration with development-specific overrides.
 * Only specifies values that differ from defaults.
 *
 * @param configService - NestJS ConfigService instance
 * @returns Development configuration overrides
 */
export const developmentConfig = (configService: ConfigService): Partial<AppConfig> => {
    // Development origins - allow common localhost ports for local development
    // These are the default ports for popular frontend frameworks:
    //   - 3000: Next.js, React (Create React App)
    //   - 3001: Alternative React/Node port
    //   - 4200: Angular CLI default
    //   - 5173: Vite default (modern frontend tooling)
    //   - 8080: Vue CLI, some Node.js apps
    // Override via ALLOWED_ORIGINS env var if you use non-default ports
    // Format: ALLOWED_ORIGINS=http://localhost:5000,http://localhost:5001
    // Note: In production, this is replaced with specific domains from ALLOWED_ORIGINS
    const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS');
    const developmentOrigins = allowedOriginsEnv
        ? allowedOriginsEnv.split(',').map((origin) => origin.trim())
        : [
              'http://localhost:3000',
              'http://localhost:3001',
              'http://localhost:4200', // Angular default
              'http://localhost:5173', // Vite default
              'http://localhost:8080', // Vue default
              'http://127.0.0.1:3000',
              'http://127.0.0.1:3001',
          ];

    return {
        cors: {
            origin: developmentOrigins,
        },
        throttle: {
            // Skip throttling in development - allows rapid testing without rate limit errors
            // Enable throttling during development if you want to test rate limit behavior
            // Change to: () => false to enable throttling in development
            skipIf: () => true, // Skip throttling in development
        },
        helmet: {
            // Disable HSTS in development - avoids HTTPS requirement on localhost
            // HSTS in development can cause issues if you switch between HTTP/HTTPS
            // HSTS is automatically enabled in production via default.config.ts
            // Only change if you're using HTTPS locally and want to test HSTS behavior
            hsts: false, // Disable HSTS in development
        },
        logging: {
            // Development logging - enable pretty printing and debug level
            // Pretty printing makes logs readable in terminal during development
            // Debug level shows more details for troubleshooting
            // Override via LOG_LEVEL and LOG_PRETTY environment variables if needed
            level: configService.get<string>('LOG_LEVEL', 'debug'),
            // Explicitly convert string to boolean - env vars are strings ("true"/"false")
            // ConfigService.get<boolean> doesn't always handle string conversion correctly
            // Default to true for development (pretty print enabled)
            prettyPrint: configService.get<string>('LOG_PRETTY', 'true') === 'true',
        },
    } as Partial<AppConfig>;
};
