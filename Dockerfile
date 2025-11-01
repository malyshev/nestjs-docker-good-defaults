# Build argument to set the Node.js version.
# You can change this to another LTS version if needed.
ARG NODE_VERSION=22

# Build arguments for image metadata
ARG VERSION=latest
ARG BUILD_DATE

# Base image for installing dependencies.
# Alpine is chosen for minimal footprint and smaller attack surface.
# Note: Consider pinning Alpine version (e.g., node:22-alpine3.21) for reproducible builds
# vs using node:22-alpine which may change unexpectedly between builds.
FROM node:${NODE_VERSION}-alpine AS install

# Set NODE_ENV to development for this stage.
# This ensures that all dependencies, including devDependencies, are installed.
ENV NODE_ENV=development

# Set working directory inside the container.
# All following commands will execute relative to this directory.
WORKDIR /opt/app

# Copy package.json and package-lock.json.
# Setting --chown=node:node ensures the "node" user owns these files inside the container.
# This avoids permission issues later, since the container runs as a non-root user.
# Only these files are copied first so Docker can reuse cached dependency layers efficiently.
COPY --chown=node:node package*.json ./

# Install all dependencies (dev + prod) as per package-lock.json.
# --silent reduces output logs for cleaner build output.
# npm ci ensures deterministic installs, matching exactly the lockfile.
RUN npm ci --silent

# --------------------------------------------------------------------------------------
# Build stage: compile the application and prepare for production
# --------------------------------------------------------------------------------------
FROM install AS build

# Copy TypeScript configuration and source code.
# Using --chown=node:node ensures files are owned by the "node" user
# (avoids permission issues later when running as non-root).
# tsconfig*.json contains TypeScript compiler settings.
# src/ contains application source code.
COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node src src/

# Optional: Lint the code
# Uncomment the following line if you want to check code style inside Docker.
# Recommended only if you don't have a CI/CD pipeline running lint checks.
#COPY ./eslint.config.mjs ./
#RUN npm run lint

# Optional: Run tests
# Uncomment this line to execute tests inside Docker.
# Normally, tests should run in CI/CD before building the image.
#RUN npm run test

# Build the application (TypeScript -> JavaScript)
# Output goes to the dist/ folder.
RUN npm run build

# Remove all node_modules including devDependencies to start fresh.
# This ensures that the final production install contains only production dependencies.
RUN rm -rf node_modules

# Reinstall only production dependencies.
# --production ensures devDependencies are excluded.
# The prepare script (husky || true) will skip gracefully if husky isn't installed.
# Native modules will still build because their install scripts run normally.
# npm cache clean --force reduces the final image size by clearing npm cache.
RUN npm ci --production && npm cache clean --force

# --------------------------------------------------------------------------------------
# Runtime stage
# --------------------------------------------------------------------------------------
# Use the official Node.js image based on Alpine Linux.
# Alpine is a minimal Linux distribution that keeps the container size small.
# NODE_VERSION is passed as a build argument or environment variable (from CI/CD).
# Note: Consider pinning Alpine version (e.g., node:22-alpine3.19) for reproducible builds
# vs using node:22-alpine which may change unexpectedly between builds.
FROM node:${NODE_VERSION}-alpine AS runtime

# Redeclare build arguments for this stage
ARG VERSION=latest
ARG BUILD_DATE

# Add metadata: who maintains this Dockerfile.
LABEL maintainer="Serhii Malyshev <malyshev.php@gmail.com>"

# Label indicating the version of the image.
# Uses the build argument $VERSION if provided, otherwise defaults to "latest".
# This is useful for tracking which version of your app or service is in the image.
LABEL org.opencontainers.image.version="${VERSION:-latest}"

# Label indicating the build timestamp of the image.
# $BUILD_DATE should be passed as a build argument (e.g., from CI/CD).
# Useful for auditing, debugging, or automated deployment pipelines.
LABEL org.opencontainers.image.created="${BUILD_DATE:-unknown}"

# Set NODE_ENV to production:
#  - npm automatically skips devDependencies
#  - frameworks (e.g., NestJS, Express) run in production mode
ENV NODE_ENV=production

# Set working directory inside the container.
# All following commands (COPY, RUN, CMD) will be executed relative to this path.
WORKDIR /opt/app

# Copy only what is required to run the app from the build stage:
#  - dist (compiled JS code of NestJS)
#  - node_modules (installed dependencies)
#  - package*.json (for npm scripts or metadata)
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/node_modules ./node_modules

# Copy custom healthcheck script into a standard location (/usr/local/bin).
# Make it executable so it can be run directly as "healthcheck".
COPY --chown=node:node healthcheck.js /usr/local/bin/healthcheck
RUN chmod +x /usr/local/bin/healthcheck

# --------------------------------------------------------------------------------------
# Cleanup unnecessary files for runtime
# --------------------------------------------------------------------------------------
# In production, we only need:
#  - compiled JavaScript code (dist/)
#  - production node_modules/
# Everything else can be removed to reduce image size and attack surface.
#
# Security rationale:
# 1. Removing package managers (npm, yarn) prevents installing new packages inside the container.
# 2. Removing package.json/yarn.lock/package-lock.json avoids leaking dependency metadata.
# 3. Smaller attack surface: fewer binaries and configs reduce potential vulnerabilities.
#
# Note: Only do this if you do NOT need to run npm/yarn scripts in production.
RUN rm -rf /opt/app/package*.json \
           /opt/app/yarn*.lock \
           /opt/app/npm* \
           /usr/local/lib/node_modules/npm \
           /usr/local/bin/npm \
           /usr/local/bin/npx \
           /usr/local/bin/yarn \
           /usr/local/bin/yarnpkg

# Explicitly switch to the non-root user "node".
# The official Node.js image already provides this user, but setting it here
# makes it obvious for anyone reading the Dockerfile that the container
# will run as a non-root user for security best practices.
USER node

# Document that the application listens on port 3000.
# This does NOT publish the port, it just informs Docker and orchestration tools.
EXPOSE 3000

# Define a container health check:
#  - --interval=30s     → check every 30 seconds
#  - --timeout=5s       → fail if no response within 5 seconds
#  - --start-period=10s → wait 10 seconds before first check (container startup time)
#  - --retries=3        → mark container unhealthy after 3 consecutive failures
#
# The healthcheck script should exit with:
#  - 0 → healthy
#  - 1 → unhealthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD healthcheck

# Set stop signal for graceful shutdown
# - Docker sends SIGTERM when container is stopped
# - NestJS will handle SIGTERM properly if enableShutdownHooks() is used
# - Explicit declaration documents behavior and prevents surprises if base image defaults change
STOPSIGNAL SIGTERM

# Final command: start the application.
# Runs the compiled NestJS application (entrypoint: dist/main.js).
CMD ["node", "dist/main.js"]
