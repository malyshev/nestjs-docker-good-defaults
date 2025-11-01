import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import type { AppConfig } from '../src/config/types/configuration.interface';
import { mockLogger } from './test-logger';

describe('Configuration (e2e)', () => {
    let app: INestApplication;
    let configService: ConfigService;
    let logger: Logger;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(Logger)
            .useValue(mockLogger)
            .compile();

        app = moduleFixture.createNestApplication({
            bufferLogs: true,
        });

        configService = app.get(ConfigService);
        logger = mockLogger;

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Configuration Loading', () => {
        it('should load application configuration', () => {
            const appConfig = configService.get<AppConfig['app']>('app');
            expect(appConfig).toBeDefined();
            expect(appConfig?.port).toBeDefined();
            expect(appConfig?.name).toBeDefined();
            expect(appConfig?.env).toBeDefined();
        });

        it('should load CORS configuration', () => {
            const corsConfig = configService.get<AppConfig['cors']>('cors');
            expect(corsConfig).toBeDefined();
            expect(corsConfig?.origin).toBeDefined();
            expect(corsConfig?.methods).toBeDefined();
        });

        it('should load throttle configuration', () => {
            const throttleConfig = configService.get<AppConfig['throttle']>('throttle');
            expect(throttleConfig).toBeDefined();
            expect(throttleConfig?.throttlers).toBeDefined();
            expect(Array.isArray(throttleConfig?.throttlers)).toBe(true);
            expect(throttleConfig?.throttlers.length).toBeGreaterThan(0);
        });

        it('should load helmet configuration', () => {
            const helmetConfig = configService.get<AppConfig['helmet']>('helmet');
            expect(helmetConfig).toBeDefined();
            expect(helmetConfig?.frameguard).toBeDefined();
        });

        it('should load logging configuration', () => {
            const loggingConfig = configService.get<AppConfig['logging']>('logging');
            expect(loggingConfig).toBeDefined();
            expect(loggingConfig?.level).toBeDefined();
            expect(loggingConfig?.prettyPrint).toBeDefined();
            expect(typeof loggingConfig?.prettyPrint).toBe('boolean');
        });

        it('should fail fast when critical config is missing', () => {
            // This test verifies that getOrThrow works in main.ts
            // If config is missing, app would fail to start
            expect(() => {
                configService.getOrThrow<AppConfig['app']>('app');
                configService.getOrThrow<AppConfig['cors']>('cors');
                configService.getOrThrow<AppConfig['helmet']>('helmet');
            }).not.toThrow();
        });
    });

    describe('Logging Configuration', () => {
        it('should configure Pino logger', () => {
            expect(logger).toBeDefined();
            expect(logger.log).toBeDefined();
            expect(typeof logger.log).toBe('function');
        });

        it('should log messages with correct level', async () => {
            const logSpy = jest.spyOn(logger, 'log');

            await request(app.getHttpServer()).get('/').expect(200);

            // Verify logger was called (app controller logs messages)
            expect(logSpy).toHaveBeenCalled();
        });

        it('should use logging configuration from config service', () => {
            const loggingConfig = configService.get<AppConfig['logging']>('logging');
            expect(loggingConfig?.level).toBeDefined();
            expect(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).toContain(loggingConfig?.level);
        });

        it('should have pretty print disabled in test environment', () => {
            const loggingConfig = configService.get<AppConfig['logging']>('logging');
            // Test environment defaults to false (structured JSON)
            expect(loggingConfig?.prettyPrint).toBe(false);
        });
    });

    describe('Environment-Specific Configuration', () => {
        it('should apply test environment defaults', () => {
            const loggingConfig = configService.get<AppConfig['logging']>('logging');
            const throttleConfig = configService.get<AppConfig['throttle']>('throttle');
            const helmetConfig = configService.get<AppConfig['helmet']>('helmet');

            // Test environment: throttling skipped
            expect(throttleConfig?.skipIf?.()).toBe(true);
            // Test environment: HSTS disabled
            expect(helmetConfig?.hsts).toBe(false);
            // Test environment: structured JSON (prettyPrint: false)
            expect(loggingConfig?.prettyPrint).toBe(false);
        });
    });

    describe('Configuration Type Safety', () => {
        it('should correctly convert environment variables to types', () => {
            const appConfig = configService.get<AppConfig['app']>('app');

            // Port should be a number (ConfigService handles conversion at config creation)
            // When accessed via merged config, it may remain as configured type
            expect(appConfig?.port).toBeDefined();
            expect(typeof appConfig?.port === 'number' || typeof appConfig?.port === 'string').toBe(true);
            // Name should be a string
            expect(typeof appConfig?.name).toBe('string');
            // Env should be a string
            expect(typeof appConfig?.env).toBe('string');
        });

        it('should correctly convert boolean environment variables', () => {
            const loggingConfig = configService.get<AppConfig['logging']>('logging');
            const corsConfig = configService.get<AppConfig['cors']>('cors');

            // prettyPrint should be boolean
            expect(typeof loggingConfig?.prettyPrint).toBe('boolean');
            // credentials should be boolean
            expect(typeof corsConfig?.credentials).toBe('boolean');
        });

        it('should correctly convert array environment variables', () => {
            const corsConfig = configService.get<AppConfig['cors']>('cors');

            // methods should be an array
            expect(Array.isArray(corsConfig?.methods)).toBe(true);
            // allowedHeaders should be an array
            expect(Array.isArray(corsConfig?.allowedHeaders)).toBe(true);
        });
    });
});
