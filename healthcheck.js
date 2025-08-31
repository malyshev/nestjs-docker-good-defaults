#!/usr/bin/env node
// --------------------------------------------------------------------------------------
// Simple HTTP Healthcheck for a Node.js / NestJS application
// --------------------------------------------------------------------------------------
// This script is intended to be used in Docker HEALTHCHECK directives.
// It performs a request to http://localhost:3000/health and exits with:
//   0 → healthy
//   1 → unhealthy
//
// Logic:
//   - 2xx and 3xx responses → container is healthy
//   - 404 → container is healthy (assume user has not defined /health)
//   - 5xx or other errors → container is unhealthy
// --------------------------------------------------------------------------------------

const http = require('http');

// Configuration for the HTTP request to the health endpoint
const options = {
    timeout: 2000, // Max time (in ms) to wait for a response
    host: 'localhost', // Target hostname inside the container
    port: 3000, // Port your NestJS app listens on
    path: '/health', // Health endpoint path (can be missing in user app)
};

// Make the HTTP request
const req = http.request(options, (res) => {
    // Treat 2xx (success) and 3xx (redirect) responses as healthy
    if (res.statusCode >= 200 && res.statusCode < 400) {
        process.exit(0);
    }
    // If the endpoint is missing (404), still treat as healthy
    // This allows containers without a /health route to pass the healthcheck
    else if (res.statusCode === 404) {
        process.exit(0);
    }
    // Any other response codes (4xx excluding 404, 5xx) are considered unhealthy
    else {
        console.error(`Healthcheck failed with status: ${res.statusCode}`);
        process.exit(1);
    }
});

// Handle network or connection errors
req.on('error', (err) => {
    // Log the error for debugging
    console.error('Healthcheck error:', err.message);
    // Exit with code 1 → unhealthy
    process.exit(1);
});

// Send the request
req.end();
