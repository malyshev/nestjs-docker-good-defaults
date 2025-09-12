import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: AppController;
    let appService: AppService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                {
                    provide: AppService,
                    useValue: {
                        getHello: jest.fn(),
                    },
                },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
        appService = app.get<AppService>(AppService);
    });

    describe('root', () => {
        it('should return "Hello World!"', () => {
            const result = 'Hello World!';
            (appService.getHello as jest.Mock).mockReturnValue(result);

            expect(appController.getHello()).toBe(result);
            expect(appService.getHello).toHaveBeenCalled();
        });
    });
});
