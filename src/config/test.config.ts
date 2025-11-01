import type { AppConfig } from './types/configuration.interface';
import type { ConfigService } from '@nestjs/config';

/**
 * Test environment configuration factory.
 *
 * Extends default configuration with test-specific overrides.
 * Only specifies values that differ from defaults.
 *
 * @param configService - NestJS ConfigService instance
 * @returns Test configuration overrides
 */
export const testConfig = (configService: ConfigService): Partial<AppConfig> =>
    ({
        app: {
            // Test port - different from development to avoid conflicts
            // Default: 3001 (dev uses 3000)
            // Change if port 3001 is in use or you need multiple test instances
            // ConfigService automatically converts string env vars to numbers when type is specified
            port: configService.get<number>('PORT', 3001),

            // Test app name - distinguishes test instance in logs
            // Useful when running tests alongside development server
            // Default: 'nestjs-app-test'
            name: configService.get<string>('APP_NAME', 'nestjs-app-test'),
        },
        cors: {
            // Allow all origins in tests - simplifies test setup
            // Tests don't need CORS restrictions - we're testing the API, not CORS behavior
            // Production uses specific domains, but tests need flexibility
            // Set to specific origins if you want to test CORS behavior
            origin: true, // Allow all origins in tests
        },
        throttle: {
            // Skip throttling in tests - allows rapid test execution without rate limit errors
            // Tests should focus on business logic, not rate limiting behavior
            // Enable throttling in specific tests if you want to test rate limit functionality:
            //   skipIf: () => false
            skipIf: () => true, // Skip throttling in tests
        },
        helmet: {
            // Disable HSTS in tests - avoids HTTPS requirement during testing
            // HSTS can interfere with test setup (HTTP vs HTTPS)
            // Test environment doesn't need production security headers
            // Enable if you want to test HSTS behavior: hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
            hsts: false, // Disable HSTS in tests
        },
    }) as Partial<AppConfig>;
