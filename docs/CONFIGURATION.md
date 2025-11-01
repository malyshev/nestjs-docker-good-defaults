# Configuration Guide

This document covers all configuration options in the template, from code quality tools to security settings.

## Configuration Structure

The template uses NestJS ConfigModule with environment-specific configuration files:

- **Environment configs** (`src/config/`): `default.config.ts`, `development.config.ts`, `production.config.ts`, `test.config.ts`
- **Type definitions** (`src/config/types/`): TypeScript interfaces for type-safe configuration
- **Configuration factory** (`src/config/configuration.ts`): Merges environment configs with environment variables

Configuration is merged in this order:

1. Default config (base values)
2. Environment-specific config (overrides defaults)
3. Environment variables (final overrides)

## Code Quality Configuration

### ESLint Configuration

Modify rules in `eslint.config.mjs`:

- **Production code**: Strict TypeScript rules with warnings for best practices
- **Test files**: Relaxed rules for testing flexibility
- **Line length**: 120 characters (configurable in `max-len` rule)

### Prettier Formatting

Customize formatting in `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "arrowParens": "avoid",
  "printWidth": 120,
  "overrides": [
    {
      "files": "*.ts",
      "options": { "tabWidth": 4 }
    }
  ]
}
```

### Coverage Thresholds

Customize coverage requirements in `package.json`:

```json
"jest": {
  "coverageThreshold": {
    "global": {
      "branches": 80,    // Branch coverage percentage
      "functions": 80,   // Function coverage percentage
      "lines": 80,       // Line coverage percentage
      "statements": 80   // Statement coverage percentage
    }
  }
}
```

### Husky Git Hooks

Git hooks are automatically configured. To customize:

**Pre-commit hook** (`.husky/pre-commit`):

```bash
npm run lint:staged
```

**Pre-push hook** (`.husky/pre-push`):

```bash
npm run test:cov  # Runs tests with coverage validation
```

## Security Configuration

Security configuration uses environment-specific config files that inherit from defaults. All configs are in `src/config/` with comprehensive comments explaining each setting.

### Helmet Security Headers

Security headers are configured in `src/config/*.config.ts` files:

- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Powered-By removal**: Hides Express version information
- **DNS Prefetch Control**: Prevents DNS prefetching
- **HSTS**: Enforces HTTPS in production (disabled in development)
- **IE Download Options**: Prevents IE from executing downloads

See [`src/config/default.config.ts`](../src/config/default.config.ts) for detailed comments explaining each setting, why it's configured this way, and when to change it.

### CORS Configuration

CORS is configured with environment-specific settings:

- **Development**: Allows common localhost ports for flexibility
- **Production**: Restricts to specific domains via `ALLOWED_ORIGINS` environment variable
- **Credentials**: Configurable via `CORS_CREDENTIALS` environment variable (default: `false`)
- **Headers**: Essential headers for API communication

Configure in `src/config/development.config.ts` and `src/config/production.config.ts`. Each file includes comments explaining why values are set this way.

### Rate Limiting Configuration

Rate limiting is configured in `src/config/*.config.ts` files:

- **Default throttling**: 100 requests per minute (configurable via `THROTTLE_TTL` and `THROTTLE_LIMIT` env vars)
- **Multiple throttlers**: Support for different rate limits per endpoint type
- **Security-first**: All endpoints are rate limited for DDoS protection
- **Environment-aware**: Throttling enabled in production, disabled in development/test environments
- **Storage options**: In-memory by default, Redis support for production scaling

Example: Add a named throttler for authentication endpoints in `src/config/default.config.ts`:

```typescript
throttle: {
    throttlers: [
        {
            ttl: 60000,
            limit: 100,
        },
        {
            name: 'auth',    // Use with @UseThrottler('auth')
            ttl: 300000,     // 5 minutes
            limit: 5,         // 5 login attempts per 5 minutes
        },
    ],
    skipIf: () => process.env.NODE_ENV !== 'production',
},
```

### Logging Configuration

Pino logging is configured in `src/config/*.config.ts` files:

- **Base logging**: Configured for all NestJS app types (HTTP, microservices, workers, etc.)
- **Development**: Pretty printing enabled for readable terminal output, debug level
- **Production**: Structured JSON logs compatible with Grafana Loki/Promtail stack
- **Environment-aware**: Log level and format adapt to environment
- **HTTP request logging**: Disabled by default (can be added via interceptor later if needed)

Configuration options:

- **Log level**: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
  - Override via `LOG_LEVEL` environment variable
  - Development default: `debug`
  - Production default: `info`

- **Pretty printing**: Human-readable formatted logs (development only)
  - Override via `LOG_PRETTY` environment variable (`true`/`false`)
  - Development default: `true`
  - Production default: `false` (structured JSON)

Example: Configure logging in `src/config/default.config.ts`:

```typescript
logging: {
    level: configService.get<string>('LOG_LEVEL', 'info'),
    prettyPrint: configService.get<boolean>('LOG_PRETTY', false),
},
```

Using the logger in your services:

```typescript
import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Injectable()
export class MyService {
  constructor(private readonly logger: Logger) {}

  doSomething() {
    this.logger.log('Starting operation', { context: MyService.name });
    this.logger.debug('Debug information', { context: MyService.name });
    this.logger.warn('Warning message', { context: MyService.name });
    this.logger.error('Error occurred', { context: MyService.name, error: error.message });
  }
}
```

**Note**: Always include `context` in your log messages for better traceability. See [Logging Guide](./LOGGING.md) for more details on using Pino.

**Grafana Stack Integration**: Production logs use structured JSON format, making them compatible with:

- **Promtail**: Collects logs from containers/files
- **Loki**: Aggregates and indexes logs
- **Grafana**: Visualizes logs and metrics

## Application Configuration

### Environment Variables

See [`.env-example`](../.env-example) for all available environment variables.

Key variables:

- `NODE_ENV` - Application environment (development, production, test)
- `PORT` - Application port (default: 3000)
- `APP_NAME` - Application name (default: 'nestjs-app')
- `ALLOWED_ORIGINS` - CORS origins (comma-separated, required in production)
- `CORS_CREDENTIALS` - Allow credentials in CORS requests (true/false, default: false)
- `THROTTLE_TTL` - Rate limit time window in milliseconds (default: 60000 = 1 minute)
- `THROTTLE_LIMIT` - Maximum requests per time window (default: 100)
- `LOG_LEVEL` - Logging level (trace, debug, info, warn, error, fatal)
  - Default: 'info' (development: 'debug', production: 'info')
- `LOG_PRETTY` - Enable pretty printing for human-readable logs (true/false)
  - Default: 'false' (development: 'true', production: 'false')
  - Must be 'false' in production for structured JSON (required for Grafana Loki/Promtail)

### Environment-Specific Configuration

Configuration files in `src/config/` are environment-aware:

- **default.config.ts**: Base defaults for all environments
- **development.config.ts**: Development-specific overrides
- **production.config.ts**: Production-specific overrides
- **test.config.ts**: Test-specific overrides

Environment configs inherit from defaults and only override what's different.

## Adding Your Own Configuration

You can extend the configuration system to add your own settings (external service APIs, feature flags, third-party integrations, etc.). This example shows how to add Paddle payment service configuration, but you can apply the same pattern to any external service (Stripe, SendGrid, etc.).

**Important**: NestJS `ConfigService.get<T>()` automatically handles type conversion. You don't need `parseInt()`, `parseFloat()`, or string-to-boolean parsing. Just specify the type as a generic parameter:

- `configService.get<number>('PORT', 3000)` - automatically converts string env vars to numbers
- `configService.get<boolean>('FEATURE_FLAG', false)` - automatically converts 'true'/'false'/'1'/'0' to booleans
- `configService.get<string>('APP_NAME', 'default')` - returns strings as-is

### Step 1: Extend the AppConfig Interface

Add your configuration properties to `src/config/types/configuration.interface.ts`:

```typescript
export interface AppConfig {
  // ... existing properties (app, cors, throttle, helmet)

  /**
   * Paddle payment service configuration
   */
  paddle?: {
    /** Paddle API base URL */
    apiUrl: string;
    /** Paddle API key for authentication */
    apiKey: string;
    /** Request timeout in milliseconds */
    timeout: number;
    /** Paddle vendor ID */
    vendorId: string;
    /** Webhook secret for verifying webhook signatures */
    webhookSecret: string;
  };
}
```

### Step 2: Add Default Values

Add defaults in `src/config/default.config.ts`:

```typescript
export const defaultConfig = (configService: ConfigService): AppConfig => ({
  // ... existing properties

  paddle: {
    apiUrl: configService.get<string>('PADDLE_API_URL', 'https://api.paddle.com'),
    apiKey: configService.getOrThrow<string>('PADDLE_API_KEY'),
    timeout: configService.get<number>('PADDLE_TIMEOUT', 10000),
    vendorId: configService.getOrThrow<string>('PADDLE_VENDOR_ID'),
    webhookSecret: configService.getOrThrow<string>('PADDLE_WEBHOOK_SECRET'),
  },
});
```

### Step 3: Override in Environment-Specific Configs (Optional)

If you need different values per environment, override in `src/config/development.config.ts`, `production.config.ts`, etc.:

```typescript
// src/config/development.config.ts
export const developmentConfig = (configService: ConfigService): Partial<AppConfig> => ({
  // ... existing overrides

  paddle: {
    apiUrl: 'https://sandbox-api.paddle.com', // Use Paddle sandbox for development
    apiKey: configService.getOrThrow<string>('PADDLE_API_KEY'),
    timeout: configService.get<number>('PADDLE_TIMEOUT', 15000), // Longer timeout for dev
    vendorId: configService.getOrThrow<string>('PADDLE_VENDOR_ID'),
    webhookSecret: configService.getOrThrow<string>('PADDLE_WEBHOOK_SECRET'),
  },
});
```

### Step 4: Update the Configuration Factory

Add your new properties to the merge logic in `src/config/configuration.ts`:

```typescript
const mergedConfig: AppConfig = {
  app: { ...baseConfig.app, ...envConfig.app },
  cors: { ...baseConfig.cors, ...envConfig.cors },
  throttle: { ...baseConfig.throttle, ...envConfig.throttle },
  helmet: { ...baseConfig.helmet, ...envConfig.helmet },
  paddle: { ...baseConfig.paddle, ...envConfig.paddle }, // Add your property
};
```

### Step 5: Use Configuration in Your Services

Inject `ConfigService` and access your configuration:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/types/configuration.interface';

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) {}

  async createSubscription() {
    const paddleConfig = this.configService.get<AppConfig['paddle']>('paddle');
    if (!paddleConfig) {
      throw new Error('Paddle configuration not found');
    }

    // Use paddleConfig.apiUrl, paddleConfig.apiKey, etc.
    // Example: Make API call to Paddle
    const response = await fetch(`${paddleConfig.apiUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paddleConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(paddleConfig.timeout),
    });

    return response.json();
  }
}
```

### Tips

- **Use type generics, not manual parsing**: ConfigService automatically handles type conversion
  - ✅ `configService.get<number>('PORT', 3000)` - automatic string-to-number conversion
  - ✅ `configService.get<boolean>('FEATURE_FLAG', false)` - automatic string-to-boolean conversion
  - ❌ Don't use `parseInt(configService.get<string>('PORT', '3000'), 10)` - it's unnecessary
- Use `configService.getOrThrow()` for required values (app fails fast if missing)
- Use `configService.get()` with defaults for optional values
- Add comments explaining what each setting does and why (following Laravel's approach)
- Keep sensitive values (API keys, passwords) in environment variables, not in config files

## CI/CD Configuration

### GitHub Actions Workflow

Modify `.github/workflows/ci.yml`:

- **Node version**: Change `node-version: '22'` to your preferred version
- **Coverage thresholds**: Adjust Jest configuration (see above)
- **Job conditions**: Modify `if` conditions for different branch behaviors

## Customization Examples

### Adding a Custom Environment

Create `src/config/staging.config.ts`:

```typescript
export const stagingConfig = (configService: ConfigService): Partial<AppConfig> => ({
  cors: {
    origin: ['https://staging.example.com'],
  },
  // ... other overrides
});
```

Add to `src/config/configuration.ts` switch statement.

### Custom Rate Limiter

Add to `throttle.throttlers` array:

```typescript
{
    name: 'api',
    ttl: 60000,    // 1 minute
    limit: 1000,   // 1000 requests per minute for API endpoints
},
```

Use with `@UseThrottler('api')` decorator.
