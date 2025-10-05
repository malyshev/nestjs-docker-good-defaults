/**
 * Helmet security configuration for NestJS applications.
 *
 * This configuration provides essential security headers for JSON APIs without over-engineering.
 * For JSON APIs, we focus on headers that provide real protection without unnecessary complexity
 * like CSP that is designed for HTML applications.
 *
 * Essential headers for API security:
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-XSS-Protection: Disables XSS filter (modern browsers set to 0 for security)
 * - X-Powered-By: Hides Express version information
 * - HSTS: Enforces HTTPS connections
 *
 * Note: Content Security Policy (CSP) is commented out as it's primarily designed
 * for HTML applications with inline scripts/styles. For JSON APIs, CSP provides
 * minimal security benefit and adds unnecessary complexity.
 *
 * If you need CSP (e.g., for serving HTML pages or admin interfaces), uncomment
 * the contentSecurityPolicy section below and adjust directives as needed.
 */
export const helmetConfig = {
    // Essential security headers for APIs
    frameguard: { action: 'deny' as const }, // X-Frame-Options: DENY - prevents clickjacking
    noSniff: true, // X-Content-Type-Options: nosniff - prevents MIME sniffing
    hidePoweredBy: true, // Removes X-Powered-By header - hides Express version
    dnsPrefetchControl: { allow: false }, // X-DNS-Prefetch-Control: off - prevents DNS prefetching
    ieNoOpen: true, // X-Download-Options: noopen - prevents IE from executing downloads
    hsts:
        process.env.NODE_ENV === 'production'
            ? {
                  // Strict-Transport-Security - enforces HTTPS (production only)
                  maxAge: 31536000, // 1 year in seconds
                  includeSubDomains: true, // Apply to all subdomains
                  preload: true, // Allow inclusion in HSTS preload lists
              }
            : false, // Disable HSTS in development to avoid localhost HTTPS issues

    // --------------------------------------------------------------------------------------
    // Content Security Policy (CSP) - OPTIONAL for JSON APIs
    // --------------------------------------------------------------------------------------
    // CSP is primarily designed for HTML applications to prevent XSS attacks by
    // controlling which resources can be loaded. For JSON APIs, CSP provides
    // minimal security benefit since:
    // 1. APIs don't serve HTML content with inline scripts/styles
    // 2. XSS attacks in APIs are handled by input validation, not CSP
    // 3. CSP adds complexity without significant security gain
    //
    // Uncomment the following section if you:
    // - Serve HTML pages (admin interfaces, documentation, etc.)
    // - Have specific security requirements for resource loading
    // - Want to implement defense-in-depth for XSS prevention
    //
    // contentSecurityPolicy: {
    //     directives: {
    //         defaultSrc: ["'self'"],                    // Default source for all resource types
    //         styleSrc: ["'self'", "'unsafe-inline'"],   // Stylesheets (allow inline for common use cases)
    //         scriptSrc: ["'self'"],                     // JavaScript files
    //         imgSrc: ["'self'", "data:", "https:"],     // Images (self, data URIs, HTTPS)
    //         connectSrc: ["'self'"],                    // AJAX, WebSocket, EventSource
    //         fontSrc: ["'self'"],                       // Fonts
    //         objectSrc: ["'none'"],                     // <object>, <embed>, <applet>
    //         mediaSrc: ["'self'"],                      // <audio>, <video>
    //         frameSrc: ["'none'"],                      // <iframe>, <frame>
    //         upgradeInsecureRequests: [],               // Upgrade HTTP to HTTPS
    //     },
    // },
};
