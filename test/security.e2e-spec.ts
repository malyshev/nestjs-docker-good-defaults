import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import { helmetConfig } from '../src/config/helmet.config';
import { corsConfig } from '../src/config/cors.config';

describe('Security Features (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(helmet(helmetConfig));
        app.enableCors(corsConfig);
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

    it('should apply rate limiting in production', async () => {
        // Set production environment before making request
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        try {
            const res = await request(app.getHttpServer()).get('/').expect(200);

            // Check that throttling headers are present in production
            expect(res.headers['x-ratelimit-limit']).toBeDefined();
            expect(res.headers['x-ratelimit-remaining']).toBeDefined();

            // Verify the actual values match our config
            expect(res.headers['x-ratelimit-limit']).toBe('100');
            expect(parseInt(res.headers['x-ratelimit-remaining'])).toBeLessThanOrEqual(100);
        } finally {
            // Restore original environment
            process.env.NODE_ENV = originalEnv;
        }
    });
});

describe('Rate Limiting (Production Environment)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        // Set production environment before app initialization
        process.env.NODE_ENV = 'production';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(helmet(helmetConfig));
        app.enableCors(corsConfig);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        // Restore development environment
        process.env.NODE_ENV = 'development';
    });

    it('should have rate limiting enabled in production', async () => {
        const res = await request(app.getHttpServer()).get('/').expect(200);

        // Verify rate limiting is active
        expect(res.headers['x-ratelimit-limit']).toBeDefined();
        expect(res.headers['x-ratelimit-remaining']).toBeDefined();
        expect(res.headers['x-ratelimit-reset']).toBeDefined();

        // Verify remaining is less than limit (first request uses 1)
        const limit = parseInt(res.headers['x-ratelimit-limit']);
        const remaining = parseInt(res.headers['x-ratelimit-remaining']);
        expect(remaining).toBeLessThan(limit);
        expect(remaining).toBeGreaterThan(0);
    });
});
