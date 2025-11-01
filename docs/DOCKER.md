# Docker Usage

This document covers all Docker-related usage, from building images to running containers with custom configurations.

## Quick Start

Build and run the production image:

```shell
docker build -t my-nest-service:latest .
docker run --rm -p 3000:3000 my-nest-service:latest
```

## Docker Build Options

### Basic Build

Build the production image with default settings:

```shell
docker build -t my-nest-service:latest .
```

### Custom Node Version

Build with a specific Node.js version:

```shell
docker build --build-arg NODE_VERSION=20 -t my-nest-service:latest .
```

### With Version and Build Date

Build with custom version and timestamp:

```shell
docker build \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t my-nest-service:1.0.0 .
```

## Running Containers

### Basic Run

```shell
docker run --rm -p 3000:3000 my-nest-service:latest
```

### Run with Custom Environment Variables

Override specific environment variables:

```shell
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com" \
  -e THROTTLE_LIMIT=200 \
  -e THROTTLE_TTL=30000 \
  my-nest-service:latest
```

### Run with Environment File

Use a `.env` file for environment variables:

```shell
# Create .env file first (see .env-example)
docker run --rm -p 3000:3000 --env-file .env my-nest-service:latest
```

### Run with docker-compose

Use `docker-compose.yml` for orchestration:

```shell
docker-compose up
```

## Environment Configuration

All security features work correctly in Docker with the default production settings. Customize via environment variables:

### Available Environment Variables

See [`.env-example`](../.env-example) for all available environment variables:

- `NODE_ENV` - Application environment (development, production, test)
- `PORT` - Application port (default: 3000)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- `THROTTLE_TTL` - Rate limit time window in milliseconds
- `THROTTLE_LIMIT` - Maximum requests per time window

### Docker Environment Configuration

Pass environment variables to containers:

**Command line:**

```shell
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e ALLOWED_ORIGINS=https://app.example.com \
  my-nest-service:latest
```

**Docker Compose:**

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - ALLOWED_ORIGINS=https://app.example.com
```

**Environment file:**

```shell
docker run --rm -p 3000:3000 --env-file .env my-nest-service:latest
```

## Health Checks

The container includes an external health check script that runs every 30 seconds:

```shell
docker run --rm -p 3000:3000 my-nest-service:latest
```

The healthcheck script is located at `healthcheck.js` and uses Node.js built-in `http` module (no external dependencies).

Check container health:

```shell
docker ps  # Shows health status
docker inspect <container-id>  # Detailed health information
```

## Multi-Stage Build Details

The Dockerfile uses a multi-stage build:

1. **Build stage**: Installs all dependencies (including devDependencies) and builds the application
2. **Runtime stage**: Copies only production dependencies and built application

This results in smaller production images with minimal attack surface.

## Security Features

- **Non-root user**: Container runs as unprivileged `node` user
- **Minimal base image**: Uses `node:22-alpine` (small, maintained, secure)
- **No dev dependencies**: Production image excludes development tools
- **Health checks**: External healthcheck script for container monitoring
