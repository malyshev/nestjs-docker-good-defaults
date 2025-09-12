# NestJS DX Template – Roadmap / Milestones

## Milestone 1: NestJS + Docker Baseline

**Goal:** Provide a working NestJS template with production-ready Docker integration as the foundation for further DX enhancements.

Tasks:

- [x] Standard NestJS project structure recognized (src/, dist/, test/) — inherited from NestJS CLI
- [x] Production-ready Dockerfile integrated
- [x] Dockerfile hardening (non-root, healthcheck, minimal image)
- [x] README added describing Docker usage and template purpose

**Priority:** critical to start any project

## Milestone 2: Code Quality & Linting

**Goal:** Ensure code standards and formatting are enforced.
Tasks:

- [x] ESLint with NestJS + TypeScript rules
- [x] Prettier for code formatting
- [x] Husky + lint-staged for pre-commit checks
- [x] CI integration for linting (GitHub Actions)

**Priority:** high; affects maintainability and future development

## Milestone 3: Type Safety & Validation

**Goal:** Ensure safe data handling and type correctness.
Tasks:

- [ ] Class-validator / class-transformer setup – enable DTO validation for controllers.
- [ ] Global validation pipe – set up NestJS ValidationPipe in main.ts with whitelist: true and forbidNonWhitelisted: true.
- [ ] Strict TypeScript compiler options – ensure strict: true in tsconfig.json, noImplicitAny, strictNullChecks, etc.
- [ ] Optional runtime type guards – for complex service logic where DTO validation isn’t enough.

**Priority:** important; TypeScript is core to NestJS

## Milestone 4: Configuration Management

**Goal:** Manage configuration and secrets safely and consistently.
Tasks:

- [ ] dotenv / env-sentinel integration
- [ ] config / directory structure for different environments
- [ ] Validation for missing or invalid environment variables

**Priority:** medium; can be implemented alongside tests

## Milestone 5: Security Defaults

**Goal:** Provide basic security defaults for both app and container.
Tasks:

- [ ] Helmet, CORS, and rate-limiting middleware
- [ ] Runtime cleanup (remove npm, package.json, devDependencies)

**Priority:** high for production; integrate after foundations + code quality

## Milestone 6: Developer Productivity & Automation

**Goal:** Make development faster and releases smoother.
Tasks:

- [ ] Automated releases
- [ ] GitHub Actions CI/CD templates (build, lint, test, release)
- [ ] Useful npm scripts (start:dev, build, lint, test, release)
- [ ] Optional generators/CLI for creating modules/services

**Priority:** lower at first; implement after core DX is stable

## Milestone 7: Observability & Health

**Goal:** Enhance health monitoring by adding NestJS health endpoint (external healthcheck script remains unchanged).
Tasks:

- [ ] Install and configure @nestjs/terminus for proper health endpoints
- [ ] Create /health endpoint with database, Redis, and service checks
- [ ] Logging setup (winston/pino) with basic formatting
- [ ] Hooks for external monitoring tools

**Priority:** lower; basic healthcheck is enough initially

## Milestone 8: Optional / Advanced Enhancements

**Goal:** Elevate template to “best-of-breed DX” level.
Tasks:

- [ ] Swagger/OpenAPI integration
- [ ] Advanced observability (metrics, Sentry, LogRocket)
- [ ] Prebuilt boilerplate modules (Auth, Users, Config)

**Priority:** optional; after stable release of core milestones
