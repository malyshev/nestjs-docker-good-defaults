# NestJS DX Template – Roadmap / Milestones

## Milestone 1: NestJS + Docker Baseline

**Goal:** Provide a working NestJS template with production-ready Docker integration as the foundation for further DX enhancements.

Tasks:

- [x] Standard NestJS project structure recognized (src/, dist/, test/) — inherited from NestJS CLI
- [x] Production-ready Dockerfile integrated
- [x] Dockerfile hardening (non-root, healthcheck, minimal image)
- [x] Runtime cleanup (remove npm, package.json, devDependencies) – security hardening
- [x] README added describing Docker usage and template purpose

**Priority:** critical to start any project
**Status:** ✅ COMPLETED

## Milestone 2: Code Quality & Linting

**Goal:** Ensure code standards and formatting are enforced.
Tasks:

- [x] ESLint with NestJS + TypeScript rules
- [x] Prettier for code formatting
- [x] Husky + lint-staged for pre-commit checks
- [x] CI integration for linting (GitHub Actions)
- [x] Coverage thresholds (80%) enforced in Jest, pre-push hooks, and CI
- [x] Unit test isolation with proper mocking
- [x] Strict TypeScript compiler options – strictNullChecks, forceConsistentCasingInFileNames, etc.
- [x] Useful npm scripts (start:dev, build, lint, test, test:cov, format)

**Priority:** high; affects maintainability and future development
**Status:** ✅ COMPLETED

## Milestone 3: Security

**Goal:** Provide essential security defaults for production applications.
Tasks:

- [x] Helmet middleware – Set security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, etc.)
- [x] CORS configuration – Configure Cross-Origin Resource Sharing with environment-specific settings
- [x] Rate limiting – Implement request rate limiting to prevent abuse and DDoS attacks

**Priority:** high; security is essential for production
**Status:** ✅ COMPLETED

## Milestone 4: Configuration & Logging

**Goal:** Manage configuration and logging consistently across environments.
Tasks:

- [ ] @nestjs/config integration – environment variable management
- [ ] Config directory structure – organize configuration for different environments (dev, test, prod)
- [ ] Logging setup (pino) with structured formatting
- [ ] Logging configuration – log levels, formats, and transports for different environments
- [ ] Request logging middleware – log HTTP requests and responses

**Priority:** high; configuration and logging are essential for production applications

## Milestone 5: Validation

**Goal:** Enable request validation using class-validator/class-transformer patterns.
Tasks:

- [ ] Class-validator / class-transformer setup – enable DTO validation for controllers
- [ ] Global validation pipe – set up NestJS ValidationPipe in main.ts with whitelist: true and forbidNonWhitelisted: true
- [ ] Configuration validation using class-validator decorators for environment variables

**Priority:** high; consistent validation approach across the application

## Milestone 6: Observability & Automation

**Goal:** Enhance observability with health monitoring and automate releases.
Tasks:

- [ ] Install and configure @nestjs/terminus for proper health endpoints
- [ ] Create /health endpoint with database, Redis, and service checks
- [ ] Hooks for external monitoring tools
- [ ] Automated releases

**Priority:** lower; implement after core DX is stable

## Milestone 7: Optional / Advanced Enhancements

**Goal:** Elevate template to "best-of-breed DX" level.
Tasks:

- [ ] Swagger/OpenAPI integration
- [ ] Advanced observability (metrics, Sentry, LogRocket)

**Priority:** optional; after stable release of core milestones
