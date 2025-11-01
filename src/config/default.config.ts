import type { AppConfig } from './types/configuration.interface';
import type { ConfigService } from '@nestjs/config';

/**
 * Default configuration factory.
 *
 * This function returns default configuration values that can be overridden
 * by environment variables or environment-specific config files.
 *
 * @param configService - NestJS ConfigService instance
 * @returns Default configuration object
 */
export const defaultConfig = (configService: ConfigService): AppConfig => ({
    app: {
        // Application environment - determines which environment-specific config is loaded
        // Set via NODE_ENV environment variable (development, production, test)
        // This affects logging, error handling, and feature flags
        env: configService.get<string>('NODE_ENV', 'development'),

        // Application port - the port on which the server will listen
        // Default: 3000 - standard Node.js port
        // Override via PORT environment variable for different ports or multiple instances
        // Example: PORT=8080 npm run start:dev
        // ConfigService automatically converts string env vars to numbers when type is specified
        port: configService.get<number>('PORT', 3000),

        // Application name - used for logging, monitoring, and identification
        // Default: 'nestjs-app'
        // Override via APP_NAME environment variable
        // Useful for distinguishing multiple services in distributed systems
        name: configService.get<string>('APP_NAME', 'nestjs-app'),
    },
    cors: {
        // Allow credentials (cookies, authorization headers) - set to false by default for security
        // When true, allows cookies and Authorization headers to be sent cross-origin
        // Only set to true if you explicitly need cookies/auth headers across origins
        // Security consideration: When true, origin cannot be '*' - must specify exact domains
        credentials: false,

        // Allowed origins - which domains can access your API
        // Default: true (will be overridden by environment-specific configs)
        // Development: localhost URLs for local development
        // Production: specific domains from ALLOWED_ORIGINS env var (comma-separated)
        // Set to false to disable CORS entirely, or ['https://example.com'] for specific domains
        origin: true,

        // Allowed HTTP methods - which HTTP verbs are permitted
        // Default includes standard REST methods
        // Remove methods you don't use (e.g., PATCH) to reduce attack surface
        // OPTIONS is required for CORS preflight requests - don't remove it
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

        // Allowed headers - which request headers clients can send
        // Content-Type and Accept are standard for API requests
        // Authorization is for bearer tokens and API keys
        // Add custom headers here if your API requires them (e.g., 'X-API-Key')
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],

        // Exposed headers - which response headers clients can access via JavaScript
        // X-Total-Count: common for pagination (total items count)
        // X-Page-Count: page count for pagination
        // Location: standard HTTP header for 201 Created responses (resource URL)
        // Add custom headers here that your frontend needs to read
        exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Location'],

        // Preflight cache duration (maxAge) - how long browsers cache CORS preflight responses
        // Value: 86400 seconds = 24 hours
        // Reduces preflight requests for better performance
        // Increase for less preflight traffic, decrease if CORS settings change frequently
        maxAge: 86400, // 24 hours
    },
    throttle: {
        // Rate limiting configuration - protects against abuse and DDoS
        // Array of throttler configurations - you can add multiple named throttlers
        // Each throttler applies rate limiting independently
        throttlers: [
            {
                // Time window (TTL) - duration in milliseconds during which requests are counted
                // Default: 60000ms = 1 minute
                // Override via THROTTLE_TTL environment variable
                // Adjust based on your API's traffic patterns and abuse patterns
                // Example: 300000 = 5 minutes for slower-changing resources
                // ConfigService automatically converts string env vars to numbers when type is specified
                ttl: configService.get<number>('THROTTLE_TTL', 60000),

                // Request limit - maximum number of requests allowed per time window
                // Default: 100 requests per time window
                // Override via THROTTLE_LIMIT environment variable
                // Tune based on:
                //   - Normal user behavior (how many requests per minute?)
                //   - API complexity (lightweight GET vs heavy POST operations)
                //   - Server capacity and infrastructure
                // Example: Lower limits (10-20) for auth endpoints, higher (200+) for read operations
                // ConfigService automatically converts string env vars to numbers when type is specified
                limit: configService.get<number>('THROTTLE_LIMIT', 100),
            },
            // Example: Add additional throttlers for specific use cases
            // {
            //     name: 'auth',          // Named throttler - use with @UseThrottler('auth')
            //     ttl: 300000,          // 5 minutes
            //     limit: 5,             // Only 5 login attempts per 5 minutes
            // },
        ],

        // Skip throttling function - determines when rate limiting should be disabled
        // Default: Skip in non-production environments (development, test)
        // Production: Always enabled for security
        // Customize this function to skip throttling for:
        //   - Admin users: () => user.isAdmin
        //   - Specific IPs: () => whitelist.includes(request.ip)
        //   - Health checks: () => request.path === '/health'
        skipIf: () => process.env.NODE_ENV !== 'production',
    },
    helmet: {
        // X-Frame-Options: DENY - prevents your site from being embedded in iframes
        // Prevents clickjacking attacks where malicious sites embed your app in invisible iframes
        // Value: { action: 'deny' } = block all iframe embedding
        // Alternatives: { action: 'sameorigin' } = allow from same origin only
        // Set to false to disable (not recommended for APIs)
        frameguard: { action: 'deny' as const },

        // X-Content-Type-Options: nosniff - prevents browsers from MIME type sniffing
        // Prevents browsers from guessing content types, which can lead to XSS vulnerabilities
        // When enabled, browsers strictly follow Content-Type headers
        // Always keep enabled for APIs serving JSON/XML
        // Set to false only if you have specific MIME type handling requirements
        noSniff: true,

        // Hide X-Powered-By header - removes "X-Powered-By: Express" header
        // Security through obscurity: hides the framework/version information
        // Attackers can use framework versions to target known vulnerabilities
        // Removing this header makes fingerprinting harder
        // Always keep enabled unless you have a specific reason to show framework info
        hidePoweredBy: true,

        // X-DNS-Prefetch-Control: off - prevents browsers from prefetching DNS
        // DNS prefetching can leak user browsing behavior
        // When disabled, browsers won't automatically resolve DNS for links/resources
        // Keep disabled for APIs to prevent unnecessary DNS lookups
        // Set to { allow: true } if you want to enable DNS prefetching for performance
        dnsPrefetchControl: { allow: false },

        // X-Download-Options: noopen - prevents IE from executing downloads automatically
        // Legacy IE security feature - prevents auto-execution of downloaded files
        // Modern browsers ignore this, but it's harmless to keep enabled
        // Set to false if you have specific IE legacy requirements
        ieNoOpen: true,

        // Strict-Transport-Security (HSTS) - enforces HTTPS connections
        // When enabled, browsers remember to always use HTTPS for this domain
        // Default: Enabled in production, disabled in development
        // IMPORTANT: Only enable in production with HTTPS - enabling without HTTPS breaks localhost
        hsts:
            configService.get<string>('NODE_ENV') === 'production'
                ? {
                      // HSTS max age - how long browsers remember to use HTTPS (in seconds)
                      // Default: 31536000 = 1 year
                      // Once set, browsers will enforce HTTPS for this duration
                      // Increase for better security, decrease if you need flexibility
                      // Common values: 31536000 (1 year), 63072000 (2 years)
                      maxAge: 31536000, // 1 year

                      // Include subdomains - applies HSTS to all subdomains
                      // When true, example.com and *.example.com all use HTTPS
                      // Recommended: true for production to protect entire domain tree
                      // Set to false if you have subdomains that don't support HTTPS yet
                      includeSubDomains: true,

                      // HSTS preload - allows inclusion in browser HSTS preload lists
                      // Browser vendors maintain lists of domains that always use HTTPS
                      // When enabled, you can submit your domain to hstspreload.org
                      // Requires includeSubDomains: true and min 1 year maxAge
                      // Only enable if you're committed to HTTPS forever (hard to remove from preload)
                      preload: true,
                  }
                : false, // Disabled in development to avoid localhost HTTPS issues
    },
    logging: {
        // Log level - determines which log messages are displayed
        // Levels: trace < debug < info < warn < error < fatal
        // Default: 'info' - shows info, warn, error, fatal (hides trace, debug)
        // Override via LOG_LEVEL environment variable
        // Development: Use 'debug' to see more details during development
        // Production: Use 'info' or 'warn' to reduce log volume
        // Example: LOG_LEVEL=debug npm run start:dev
        level: configService.get<string>('LOG_LEVEL', 'info'),

        // Pretty printing - formats logs for human readability
        // Default: false (structured JSON) - better for production log aggregation
        // Development: Enable pretty printing for easier reading in terminal
        // Production: Disable pretty printing - use structured JSON for log parsing (Promtail/Loki compatible)
        // Pretty printing adds overhead - only use in development
        // Override via LOG_PRETTY environment variable (true/false)
        // Note: Structured JSON in production is compatible with Grafana Loki/Promtail stack
        // Explicitly convert string to boolean - env vars are strings ("true"/"false")
        // ConfigService.get<boolean> doesn't always handle string conversion correctly
        prettyPrint: configService.get<string>('LOG_PRETTY', 'false') === 'true',
    },
});
