import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import { helmetConfig } from '../src/config/helmet.config';

describe('Helmet Security (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(helmet(helmetConfig));
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
});
