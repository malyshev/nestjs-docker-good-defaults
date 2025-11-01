import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import type { AppConfig } from '../src/config/types/configuration.interface';
import { mockLogger } from './test-logger';

describe('Security Features (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(Logger)
            .useValue(mockLogger)
            .compile();

        app = moduleFixture.createNestApplication();

        // Apply security middleware using ConfigService (same as main.ts)
        const configService = app.get(ConfigService);
        const helmetConfig = configService.getOrThrow<AppConfig['helmet']>('helmet');
        const corsConfig = configService.getOrThrow<AppConfig['cors']>('cors');

        if (helmetConfig) {
            app.use(helmet(helmetConfig));
        }
        if (corsConfig) {
            app.enableCors(corsConfig);
        }

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should apply essential security headers', async () => {
        const res = await request(app.getHttpServer()).get('/').expect(200);

        expect(res.headers['x-frame-options']).toBe('DENY');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['x-dns-prefetch-control']).toBe('off');
        expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should apply CORS headers', async () => {
        const res = await request(app.getHttpServer()).get('/').set('Origin', 'http://localhost:3000').expect(200);

        expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
        expect(res.headers['access-control-expose-headers']).toBeDefined();
    });

    it('should disable HSTS in development', async () => {
        const res = await request(app.getHttpServer()).get('/').expect(200);

        // HSTS should be disabled in development
        expect(res.headers['strict-transport-security']).toBeUndefined();
    });

    it('should skip rate limiting in development', async () => {
        const res = await request(app.getHttpServer()).get('/').expect(200);

        // Rate limiting headers should not be present in development (skipIf returns true)
        expect(res.headers['x-ratelimit-limit']).toBeUndefined();
        expect(res.headers['x-ratelimit-remaining']).toBeUndefined();
    });
});

describe('Rate Limiting (Production Environment)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        // Set production environment before app initialization
        process.env.NODE_ENV = 'production';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(Logger)
            .useValue(mockLogger)
            .compile();

        app = moduleFixture.createNestApplication();

        // Apply security middleware using ConfigService (same as main.ts)
        const configService = app.get(ConfigService);
        const helmetConfig = configService.getOrThrow<AppConfig['helmet']>('helmet');
        const corsConfig = configService.getOrThrow<AppConfig['cors']>('cors');

        if (helmetConfig) {
            app.use(helmet(helmetConfig));
        }
        if (corsConfig) {
            app.enableCors(corsConfig);
        }

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        // Restore development environment
        process.env.NODE_ENV = 'development';
    });

    it('should have rate limiting enabled in production', async () => {
        const res = await request(app.getHttpServer()).get('/').expect(200);

        // Verify rate limiting is active (skipIf returns false in production)
        expect(res.headers['x-ratelimit-limit']).toBeDefined();
        expect(res.headers['x-ratelimit-remaining']).toBeDefined();
        expect(res.headers['x-ratelimit-reset']).toBeDefined();

        // Verify remaining is less than limit (first request uses 1)
        const limit = parseInt(res.headers['x-ratelimit-limit']);
        const remaining = parseInt(res.headers['x-ratelimit-remaining']);
        expect(remaining).toBeLessThan(limit);
        expect(remaining).toBeGreaterThan(0);
    });

    it('should enable HSTS in production', async () => {
        const res = await request(app.getHttpServer()).get('/').expect(200);

        // HSTS should be enabled in production
        expect(res.headers['strict-transport-security']).toBeDefined();
        expect(res.headers['strict-transport-security']).toMatch(/max-age=31536000/);
        expect(res.headers['strict-transport-security']).toMatch(/includeSubDomains/);
        expect(res.headers['strict-transport-security']).toMatch(/preload/);
    });
});
