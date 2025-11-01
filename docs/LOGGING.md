# Logging with Pino

This guide explains how logging is configured in the NestJS application using Pino, and how to set up the Grafana stack for log aggregation and visualization.

## Overview

This application uses [Pino](https://getpino.io/), a fast and low-overhead JSON logger for Node.js applications. Pino provides structured logging with excellent performance, making it ideal for production environments.

### Why Pino?

- **Performance**: One of the fastest Node.js loggers with minimal overhead
- **Structured Logging**: JSON output that's easy to parse and query
- **Compatibility**: Works seamlessly with log aggregation tools (Grafana Loki, ELK stack, etc.)
- **Production Ready**: Designed for production use with configurable log levels

## Pino Configuration

Pino is integrated via `nestjs-pino`, which provides NestJS-specific functionality while maintaining Pino's performance and flexibility.

### Configuration Options

Logging is configured through the application's configuration system (see [Configuration Guide](./CONFIGURATION.md)):

**Environment Variables:**

- `LOG_LEVEL`: Log level (trace, debug, info, warn, error, fatal). Default: `info`
- `LOG_PRETTY`: Enable pretty printing for development. Default: `false`

**Configuration Files:**

- `src/config/default.config.ts`: Default logging settings
- `src/config/development.config.ts`: Development overrides (pretty print enabled, debug level)
- `src/config/production.config.ts`: Production overrides (structured JSON, info level)

### Environment-Specific Behavior

**Development:**

- Pretty printing enabled for human-readable output
- Debug level for detailed logging
- Colorized output in terminal

**Production:**

- Structured JSON output (one log per line)
- Info level by default
- Compatible with log aggregation systems (Grafana Loki, Promtail)

### Log Levels

Pino uses standard log levels (ordered by severity):

- `trace` (10): Most verbose, includes all logs
- `debug` (20): Debug information for development
- `info` (30): General informational messages (default)
- `warn` (40): Warning messages
- `error` (50): Error messages
- `fatal` (60): Fatal errors that cause application termination

Only logs at or above the configured level are output.

## Using the Logger

### Dependency Injection

Inject the `Logger` from `nestjs-pino` in your services and controllers:

```typescript
import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Injectable()
export class MyService {
  constructor(private readonly logger: Logger) {}

  doSomething() {
    this.logger.log('Processing request', { context: MyService.name });
    this.logger.debug('Debug information', { context: MyService.name });
    this.logger.warn('Warning message', { context: MyService.name });
    this.logger.error('Error occurred', { context: MyService.name });
  }
}
```

### Log Methods

The logger provides methods for each log level:

```typescript
// Information log (level: info)
this.logger.log('Application started', { context: AppService.name });

// Debug log
this.logger.debug('Processing request', { context: AppService.name });

// Warning log
this.logger.warn('Deprecated method used', { context: AppService.name });

// Error log (typically includes Error object)
this.logger.error('Database connection failed', {
  context: DatabaseService.name,
  error: error.message,
  stack: error.stack,
});

// Fatal log (application termination)
this.logger.fatal('Unrecoverable error', { context: AppService.name });
```

### Context Metadata

Always include context in your log messages to identify the source:

```typescript
// Good: Includes context
this.logger.log('User created', {
  context: UserService.name,
  userId: user.id,
});

// Avoid: No context
this.logger.log('User created');
```

### Structured Logging

Pino supports structured logging with additional metadata:

```typescript
this.logger.log('Order processed', {
  context: OrderService.name,
  orderId: order.id,
  userId: order.userId,
  amount: order.amount,
  timestamp: new Date().toISOString(),
});
```

This produces JSON output like:

```json
{
  "level": 30,
  "time": 1635782400000,
  "msg": "Order processed",
  "context": "OrderService",
  "orderId": "123",
  "userId": "456",
  "amount": 99.99
}
```

## Log Output Formats

### Development (Pretty Print)

When `LOG_PRETTY=true`, logs are formatted for readability:

```
[2024-01-15 10:30:45] INFO (AppService): Application started
[2024-01-15 10:30:46] DEBUG (AppController): Processing request
```

### Production (Structured JSON)

When `LOG_PRETTY=false`, logs are output as structured JSON:

```json
{"level":30,"time":1635782400000,"msg":"Application started","context":"AppService"}
{"level":20,"time":1635782401000,"msg":"Processing request","context":"AppController"}
```

This format is optimal for:

- Log aggregation systems (Grafana Loki, ELK stack)
- Automated log parsing and analysis
- Production monitoring and alerting

## Application Startup

The application logs its startup message when ready:

```typescript
// In src/main.ts
logger.log(`Application started at http://localhost:${appConfig.port}`);
```

This provides a clear indication that the application has successfully started and is ready to accept requests.

## Log Aggregation with Grafana Stack

For production environments, you can use the Grafana stack (Loki, Promtail, Grafana) to aggregate, index, and visualize logs from your NestJS application. See the [Grafana Stack Setup](#grafana-stack-setup) section below.

---

## Grafana Stack Setup

This section explains how to set up Promtail, Loki, and Grafana for log aggregation and visualization with your NestJS application.

### Overview

The monitoring stack consists of:

- **Loki**: Aggregates and indexes logs from your application
- **Promtail**: Collects logs from Docker containers
- **Grafana**: Visualizes logs and metrics

This stack is compatible with Pino's structured JSON logs, making it easy to query and visualize your application logs.

## Prerequisites

- Docker and Docker Compose installed
- Your NestJS application running in Docker (with structured JSON logs in production)

## Quick Start

### 1. Start the Monitoring Stack

```shell
docker-compose up -d
```

This starts:

- Loki on `http://localhost:3100`
- Promtail (no external port, internal only)
- Grafana on `http://localhost:3001`

### 2. Configure Your Application Container

When running your NestJS application container, add the `promtail.scrape=true` label:

```shell
docker run -d \
  --name nestjs-app \
  --label promtail.scrape=true \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e LOG_PRETTY=false \
  my-nest-service:latest
```

Or use Docker Compose:

```yaml
services:
  app:
    image: my-nest-service:latest
    labels:
      - 'promtail.scrape=true'
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - LOG_PRETTY=false
    networks:
      - monitoring
```

### 3. Access Grafana

1. Open `http://localhost:3001` in your browser
2. **First login** (you will be asked to change password):
   - Username: `admin`
   - Password: `admin`
   - **Important**: Grafana will prompt you to change the password on first login (this is a security requirement)
   - Enter a secure password when prompted
3. **Loki datasource** is automatically provisioned:
   - The Loki datasource is configured automatically via `docker/grafana/grafana-datasource.yml`
   - URL: `http://loki:3100`
   - You can verify it in **Configuration → Data Sources**
4. **Default dashboard** is automatically loaded:
   - The application logs dashboard is provisioned automatically via `docker/grafana/grafana-dashboard-app-logs.json`
   - You can find it in **Dashboards → Browse**
   - The dashboard shows logs from your NestJS application with filters for log levels and search functionality

### 4. Query Logs in Grafana

Once Loki is configured as a data source, you can query logs:

**Basic query:**

```
{container=~".*app.*"}
```

**Filter by log level:**

```
{container=~".*app.*"} |= "error"
```

**Parse JSON fields:**

```
{container=~".*app.*"} | json | level="error"
```

## Configuration

### Promtail Configuration

The Promtail configuration (`docker/promtail/config.yml`) is set up to:

- Collect logs from Docker containers with `promtail.scrape=true` label
- Parse JSON logs from Pino
- Forward logs to Loki

**Customize Promtail:**

Edit `docker/promtail/config.yml` to:

- Add custom labels
- Filter specific containers
- Parse additional log formats

### Application Configuration

Ensure your NestJS application outputs structured JSON logs in production:

**Environment variables:**

```bash
NODE_ENV=production
LOG_PRETTY=false  # Structured JSON (required for Loki)
LOG_LEVEL=info    # Adjust log level as needed
```

**In `production.config.ts`:**

```typescript
logging: {
    level: configService.get<string>('LOG_LEVEL', 'info'),
    prettyPrint: false, // Structured JSON for Loki
},
```

## Grafana Dashboards

### Default Dashboard

The automatically provisioned dashboard (`docker/grafana/grafana-dashboard-app-logs.json`) includes:

- **Log Levels Overview**: Visual breakdown of log levels
- **Errors & Warnings**: Filtered view of critical logs
- **All Application Logs**: Full log viewer with search functionality
- **Search Bar**: Free-text search across logs
- **Log Level Filter**: Filter by log level (Info, Warn, Error)

### Create a Custom Dashboard

1. Go to **Dashboards → New Dashboard**
2. Add a **Logs** panel
3. Configure the query:
   ```
   {container=~".*app.*"}
   ```
4. Save the dashboard

### Useful Log Queries

**Errors only:**

```
{container=~".*app.*"} | json | level="error"
```

**Errors and warnings:**

```
{container=~".*app.*"} | json | level=~"error|warn"
```

**By log level:**

```
{container=~".*app.*"} | json | level="info"
```

**Search for specific text:**

```
{container=~".*app.*"} |= "database connection"
```

**Time range queries:**

```
{container=~".*app.*"} | json | level="error" [5m]
```

## Stopping the Stack

```shell
docker-compose down
```

To also remove volumes (and lose log data):

```shell
docker-compose down -v
```

## Production Considerations

### Security

1. **Change default Grafana credentials:**

   ```yaml
   environment:
     - GF_SECURITY_ADMIN_PASSWORD=your-secure-password
   ```

2. **Use environment variables for sensitive config:**
   - Store passwords in `.env` file
   - Don't commit credentials to version control

3. **Network isolation:**
   - Use Docker networks to isolate services
   - Only expose necessary ports

### Persistence

Data is stored in Docker volumes:

- `loki-data`: Loki's log data and indexes
- `grafana-data`: Grafana dashboards and settings

To backup:

```shell
docker run --rm -v nestjs-docker-good-defaults_loki-data:/data -v $(pwd):/backup alpine tar czf /backup/loki-backup.tar.gz /data
```

### Performance

For production deployments:

- Configure Loki retention policies
- Set up log rotation
- Monitor Promtail resource usage
- Scale Grafana if needed

## Troubleshooting

### Logs Not Appearing in Grafana

1. **Check Promtail logs:**

   ```shell
   docker logs promtail
   ```

2. **Verify container label:**

   ```shell
   docker inspect nestjs-app | grep promtail
   ```

3. **Check Loki is receiving logs:**

   ```shell
   docker logs loki
   ```

4. **Verify Loki data source in Grafana:**
   - Test connection in Grafana UI
   - Check URL: `http://loki:3100`

### JSON Parsing Issues

If logs aren't parsing as JSON:

- Verify `LOG_PRETTY=false` in production
- Check Pino output format (should be JSON)
- Review Promtail configuration for JSON parsing

## Additional Resources

- [Pino Documentation](https://getpino.io/)
- [nestjs-pino Documentation](https://github.com/iamolegga/nestjs-pino)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Promtail Documentation](https://grafana.com/docs/loki/latest/clients/promtail/)
- [Grafana Logs Documentation](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/logs/)
