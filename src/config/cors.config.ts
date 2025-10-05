/**
 * CORS configuration for NestJS applications.
 *
 * Cross-Origin Resource Sharing (CORS) controls which domains can access your API.
 * This configuration provides sensible defaults for different environments while
 * maintaining security for production deployments.
 *
 * Key considerations:
 * - Development: Allow localhost and common dev ports for flexibility
 * - Production: Restrict to specific domains for security
 * - Credentials: Only allow when necessary (cookies, auth headers)
 * - Methods: Limit to what your API actually uses
 * - Headers: Control which headers clients can send
 */
export const corsConfig = {
    // Allow credentials (cookies, authorization headers) - use with caution
    // If using cookies or Authorization headers across origins, set to true and ensure origin is not '*'
    credentials: false,

    // Allowed origins - environment-specific
    origin:
        process.env.NODE_ENV === 'production'
            ? (process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) ?? ['https://yourdomain.com'])
            : [
                  'http://localhost:3000',
                  'http://localhost:3001',
                  'http://localhost:4200', // Angular default
                  'http://localhost:5173', // Vite default
                  'http://localhost:8080', // Vue default
                  'http://127.0.0.1:3000',
                  'http://127.0.0.1:3001',
              ],

    // HTTP methods allowed
    methods: process.env.ALLOWED_METHODS?.split(',').filter(Boolean) ?? [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
    ],

    // Headers that can be sent by the client
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],

    // Headers that can be exposed to the client
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'Location', // For 201 Created responses
    ],

    // How long preflight requests can be cached (in seconds)
    maxAge: 86400, // 24 hours
};
