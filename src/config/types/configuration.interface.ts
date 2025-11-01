/**
 * Application configuration interface.
 *
 * This interface defines the structure of application configuration that combines
 * environment variables with file-based configuration. All configuration values
 * can be overridden via environment variables.
 */
export interface AppConfig {
    /**
     * Application environment settings
     */
    app: {
        /** Application environment (development, production, test) */
        env: string;
        /** Application port */
        port: number;
        /** Application name */
        name: string;
    };

    /**
     * CORS configuration
     */
    cors: {
        /** Allow credentials (cookies, authorization headers) */
        credentials: boolean;
        /** Allowed origins */
        origin: string[] | string | boolean;
        /** Allowed HTTP methods */
        methods: string[];
        /** Allowed headers */
        allowedHeaders: string[];
        /** Exposed headers */
        exposedHeaders: string[];
        /** Preflight cache duration in seconds */
        maxAge: number;
    };

    /**
     * Rate limiting configuration
     */
    throttle: {
        /** Array of throttler configurations */
        throttlers: Array<{
            /** Time window in milliseconds */
            ttl: number;
            /** Maximum requests per time window */
            limit: number;
        }>;
        /** Function to determine if throttling should be skipped */
        skipIf?: () => boolean;
    };

    /**
     * Helmet security headers configuration
     * Matches Helmet's configuration options format
     */
    helmet: {
        /** X-Frame-Options: deny - prevents clickjacking */
        frameguard?: { action: 'deny' } | false;
        /** X-Content-Type-Options: nosniff - prevents MIME sniffing */
        noSniff?: boolean;
        /** Remove X-Powered-By header - hides Express version */
        hidePoweredBy?: boolean;
        /** X-DNS-Prefetch-Control: off - prevents DNS prefetching */
        dnsPrefetchControl?: { allow: boolean } | false;
        /** X-Download-Options: noopen - prevents IE from executing downloads */
        ieNoOpen?: boolean;
        /** Strict-Transport-Security - enforces HTTPS */
        hsts?:
            | {
                  maxAge: number;
                  includeSubDomains: boolean;
                  preload: boolean;
              }
            | false;
    };

    /**
     * Pino logging configuration
     * Base logging configuration - HTTP request logging can be added via interceptor later
     */
    logging: {
        /** Log level (trace, debug, info, warn, error, fatal) */
        level: string;
        /** Enable pretty printing (development only - use structured JSON in production) */
        prettyPrint: boolean;
    };
}

/**
 * Pino HTTP configuration interface
 * Used for configuring nestjs-pino LoggerModule
 */
export interface PinoHttpConfig {
    /** Log level */
    level: string;
    /** Disable automatic HTTP request logging */
    autoLogging: boolean;
    /** Optional transport configuration for pretty printing */
    transport?: {
        target: string;
        options: {
            singleLine: boolean;
            colorize: boolean;
        };
    };
}
