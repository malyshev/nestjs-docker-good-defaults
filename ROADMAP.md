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
- [ ] Rate limiting – Implement request rate limiting to prevent abuse and DDoS attacks

**Priority:** high; security is essential for production

## Milestone 4: Configuration & Validation

**Goal:** Manage configuration and validation consistently using class-validator/class-transformer patterns.
Tasks:

- [ ] Class-validator / class-transformer setup – enable DTO validation for controllers and configs
- [ ] Global validation pipe – set up NestJS ValidationPipe in main.ts with whitelist: true and forbidNonWhitelisted: true
- [ ] dotenv / env-sentinel integration
- [ ] config / directory structure for different environments
- [ ] Configuration validation using class-validator decorators for environment variables

**Priority:** high; consistent validation approach across the application

## Milestone 5: Developer Productivity & Automation

**Goal:** Make development faster and releases smoother.
Tasks:

- [ ] Automated releases
- [ ] Optional generators/CLI for creating modules/services

**Priority:** lower at first; implement after core DX is stable

## Milestone 6: Observability & Health

**Goal:** Enhance health monitoring by adding NestJS health endpoint (external healthcheck script remains unchanged).
Tasks:

- [ ] Install and configure @nestjs/terminus for proper health endpoints
- [ ] Create /health endpoint with database, Redis, and service checks
- [ ] Logging setup (winston/pino) with basic formatting
- [ ] Hooks for external monitoring tools

**Priority:** lower; basic healthcheck is enough initially

## Milestone 7: Optional / Advanced Enhancements

**Goal:** Elevate template to "best-of-breed DX" level.
Tasks:

- [ ] Swagger/OpenAPI integration
- [ ] Advanced observability (metrics, Sentry, LogRocket)
- [ ] Prebuilt boilerplate modules (Auth, Users, Config)

**Priority:** optional; after stable release of core milestones
