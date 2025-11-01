# Development Workflow

This document covers the development workflow, including code quality checks, testing, and CI/CD integration.

## Code Quality Checks

Run code quality checks locally:

```shell
# Run linting
npm run lint

# Check formatting
npm run format:check

# Fix formatting
npm run format

# Run tests with coverage
npm run test:cov

# Run e2e tests (includes security header tests)
npm run test:e2e
```

## Git Hooks (Automatic)

Git hooks run automatically on commit and push:

### Pre-commit Hook

Runs before each commit:

- **ESLint**: Lints staged TypeScript files
- **Prettier**: Formats staged files

Files are automatically fixed if possible, or commit is blocked if errors remain.

### Pre-push Hook

Runs before each push:

- **Tests**: Runs full test suite with coverage validation
- **Coverage**: Enforces 80% threshold (configurable)

Push is blocked if tests fail or coverage is below threshold.

## CI/CD Pipeline

### Feature Branches

Automatic validation on pull requests:

- **Linting**: ESLint checks on all TypeScript files
- **Build**: TypeScript compilation verification
- **Tests**: Unit tests execution

### Main Branch

Full CI pipeline:

- **Linting**: ESLint checks
- **Build**: TypeScript compilation
- **Tests**: Full test suite with coverage
- **Security**: Security audits via npm audit
- **Coverage enforcement**: 80% threshold required

## Testing

### Unit Tests

Run unit tests:

```shell
npm test
```

Run with coverage:

```shell
npm run test:cov
```

Run in watch mode:

```shell
npm run test:watch
```

### E2E Tests

Run end-to-end tests:

```shell
npm run test:e2e
```

E2E tests include:

- Application functionality tests
- Security header tests (Helmet, CORS)
- Rate limiting tests (production environment)

## Local Development

### Start Development Server

```shell
npm run start:dev
```

The server starts with:

- Hot reload on file changes
- Development configuration (CORS allows localhost, throttling disabled)
- Detailed error messages

### Start with Custom Port

```shell
PORT=8080 npm run start:dev
```

### Start in Production Mode

```shell
NODE_ENV=production npm run start:dev
```

Note: Production mode enables:

- Rate limiting
- HSTS headers
- Production CORS settings (requires `ALLOWED_ORIGINS` env var)

## Environment Variables

For local development, create a `.env` file (see `.env-example`):

```shell
# Copy example file
cp .env-example .env

# Edit with your values
NODE_ENV=development
PORT=3000
```

Environment variables are loaded automatically via NestJS ConfigModule.

## Code Formatting

### Format All Files

```shell
npm run format
```

### Check Formatting

```shell
npm run format:check
```

### Auto-format on Save

Configure your IDE to run Prettier on save. Formatting rules are in `.prettierrc`.

## Debugging

### Run with Debugger

```shell
npm run start:debug
```

### Test Debugging

```shell
npm run test:debug
```

## Troubleshooting

### Tests Failing

1. Check coverage threshold: `npm run test:cov`
2. Verify environment: Ensure `NODE_ENV=test` for test suite
3. Check for linting errors: `npm run lint`

### Git Hooks Not Running

1. Verify Husky is installed: `npm run prepare`
2. Check `.husky/` directory exists
3. Ensure hooks are executable: `chmod +x .husky/*`

### Configuration Not Loading

1. Verify `.env` file exists (if using environment variables)
2. Check ConfigModule is imported in `AppModule`
3. Verify environment variable names match `.env-example`
