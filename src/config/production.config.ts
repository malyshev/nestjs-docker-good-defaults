import type { AppConfig } from './types/configuration.interface';
import type { ConfigService } from '@nestjs/config';

/**
 * Production environment configuration factory.
 *
 * Extends default configuration with production-specific overrides.
 * Only specifies values that differ from defaults.
 *
 * @param configService - NestJS ConfigService instance
 * @returns Production configuration overrides
 */
export const productionConfig = (configService: ConfigService): Partial<AppConfig> => {
    // Production CORS origins - MUST be set via ALLOWED_ORIGINS environment variable
    // Format: comma-separated list of HTTPS URLs
    // Example: ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
    // Security: Never use '*' in production - always specify exact domains
    // Never include HTTP (only HTTPS) in production for security
    // Add all domains that need to access your API (web app, mobile app domains, etc.)
    const allowedOrigins = configService
        .get<string>('ALLOWED_ORIGINS', 'https://yourdomain.com')
        .split(',')
        .filter(Boolean);

    return {
        cors: {
            // Production origins - specific domains that can access your API
            // Set via ALLOWED_ORIGINS environment variable (comma-separated)
            // Example Docker: -e ALLOWED_ORIGINS=https://app.example.com,https://api.example.com
            // Example .env: ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
            // IMPORTANT: Update this before deploying to production!
            origin: allowedOrigins,

            // CORS credentials - allow cookies/authorization headers cross-origin
            // Default: false (most secure)
            // Set to true only if you need cookies or Authorization headers from frontend
            // When true:
            //   - Cookies can be sent cross-origin (e.g., session cookies)
            //   - Authorization headers work with credentials: 'include' in fetch
            //   - Origin must be specific (cannot be '*')
            // Security: Only enable if explicitly needed - increases CSRF attack surface
            // Override via CORS_CREDENTIALS environment variable: true/false
            // ConfigService automatically converts string env vars to booleans when type is specified
            // Accepts: 'true', 'false', '1', '0' (case-insensitive)
            credentials: configService.get<boolean>('CORS_CREDENTIALS', false),
        },
        throttle: {
            // Enable throttling in production - always active to prevent abuse
            // Rate limiting is critical in production to prevent:
            //   - DDoS attacks (overwhelming your server)
            //   - API abuse (excessive requests from single user/IP)
            //   - Resource exhaustion (preventing legitimate users from accessing service)
            // Do not disable in production - this is a security feature
            skipIf: () => false, // Enable throttling in production
        },
        helmet: {
            // HSTS in production - enforce HTTPS for all connections
            // This tells browsers to always use HTTPS for your domain
            // Once set, browsers remember this for the maxAge duration
            // Critical security setting for production APIs
            hsts: {
                // HSTS duration: 1 year (31536000 seconds)
                // Browsers will remember to use HTTPS for this duration
                // Cannot be reduced once set (browsers cache this value)
                // Standard value for production - provides strong security
                maxAge: 31536000, // 1 year

                // Include all subdomains in HSTS policy
                // When true, *.yourdomain.com all enforce HTTPS
                // Required for HSTS preload eligibility
                // Only set to false if you have subdomains without HTTPS support
                includeSubDomains: true,

                // Enable HSTS preload - submit your domain to browser preload lists
                // Once in preload list, browsers always use HTTPS (even first visit)
                // Requirements:
                //   - HTTPS must be working on all subdomains
                //   - Must have includeSubDomains: true
                //   - Must commit to HTTPS long-term (hard to remove from preload)
                // Submit at: https://hstspreload.org
                preload: true,
            },
        },
        logging: {
            // Production logging - structured JSON, info level
            // Disable pretty printing - use structured JSON for log aggregation (Promtail/Loki compatible)
            // Info level shows standard operational messages without debug noise
            // Structured JSON logs work seamlessly with Grafana Loki/Promtail stack
            // Override via LOG_LEVEL and LOG_PRETTY environment variables if needed
            level: configService.get<string>('LOG_LEVEL', 'info'),
            // Explicitly convert string to boolean - env vars are strings ("true"/"false")
            // ConfigService.get<boolean> doesn't always handle string conversion correctly
            prettyPrint: configService.get<string>('LOG_PRETTY', 'false') === 'true',
        },
    } as Partial<AppConfig>;
};
