import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
    });

    afterEach(async () => {
        await module.close();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should have AppController', () => {
        const controller = module.get<AppController>(AppController);
        expect(controller).toBeDefined();
    });

    it('should have AppService', () => {
        const service = module.get<AppService>(AppService);
        expect(service).toBeDefined();
    });
});
