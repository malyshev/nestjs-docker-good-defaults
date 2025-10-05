import type { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Throttler configuration for NestJS applications.
 *
 * Rate limiting helps prevent abuse and DDoS attacks by limiting the number
 * of requests a client can make within a specified time window.
 *
 * Configuration options explained:
 * - throttlers: Array of rate limit configurations (can add multiple named throttlers)
 * - skipIf: Skip throttling for specific conditions (e.g., admin users)
 * - ignoreUserAgents: Skip throttling for specific user agents (e.g., health checks)
 * - errorMessage: Custom error message when rate limit is exceeded
 * - storage: Storage backend (default: in-memory, Redis is optional infrastructure dependency)
 */
export const throttlerConfig: ThrottlerModuleOptions = {
    // Rate limit configurations (add more named throttlers as needed)
    throttlers: [
        {
            name: 'default',
            ttl: parseInt(process.env.THROTTLE_TTL ?? '60000'), // 1 minute (template default - adjust per service/load)
            limit: parseInt(process.env.THROTTLE_LIMIT ?? '100'), // 100 requests (template default - adjust per service/load)
        },
        // Example: Add a custom throttler for specific endpoints
        // {
        //     name: 'auth',
        //     ttl: 300000, // 5 minutes
        //     limit: 5, // 5 requests
        // },
    ],

    // Note: Health checks are rate limited for security
    // Use separate throttler with higher limits if needed for monitoring
    ignoreUserAgents: [],

    // Custom error message (default: "Too Many Requests")
    errorMessage: 'Too Many Requests',

    // Skip throttling only in development and test environments (secure by default)
    skipIf: () => process.env.NODE_ENV !== 'production',

    // Storage backend (default: ThrottlerStorageMemoryService)
    // Use Redis in production for multiple instances - in-memory storage is not shared between instances
    // Note: Redis is optional infrastructure dependency, not enabled by default
    // storage: new ThrottlerStorageRedisService(redis), // Uncomment for Redis
};
