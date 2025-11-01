import { Logger } from 'nestjs-pino';

/**
 * Silent logger mock for e2e tests.
 * No-op methods to suppress all log output.
 */
export const mockLogger: Logger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    fatal: jest.fn(),
    setContext: jest.fn(),
} as unknown as Logger;
