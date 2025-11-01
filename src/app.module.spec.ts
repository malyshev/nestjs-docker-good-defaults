import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config/configuration';
import { loggerModuleFactory, throttlerModuleFactory } from './app.module.factory';

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

    it('should initialize AppModule with prettyPrint enabled', async () => {
        // Test branch coverage: line 35 - transport assignment when prettyPrint is true
        const originalEnv = process.env.NODE_ENV;
        const originalLogPretty = process.env.LOG_PRETTY;

        try {
            process.env.NODE_ENV = 'development';
            process.env.LOG_PRETTY = 'true';

            const testModule = await Test.createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        load: [configuration],
                        envFilePath: [],
                    }),
                    AppModule,
                ],
            }).compile();

            expect(testModule).toBeDefined();
            await testModule.close();
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalLogPretty) {
                process.env.LOG_PRETTY = originalLogPretty;
            } else {
                delete process.env.LOG_PRETTY;
            }
        }
    });

    describe('Error handling', () => {
        it('should throw error when logging configuration is missing', () => {
            // Test branch coverage: line in loggerModuleFactory - error thrown when loggingConfig is falsy
            const mockConfigService = {
                get: jest.fn((key: string) => {
                    if (key === 'logging') {
                        return undefined; // Missing logging config
                    }
                    return null;
                }),
            } as unknown as ConfigService;

            expect(() => loggerModuleFactory(mockConfigService)).toThrow(
                'Logging configuration not found. Ensure ConfigModule is properly configured.',
            );
        });

        it('should throw error when throttle configuration is missing', () => {
            // Test branch coverage: line in throttlerModuleFactory - error thrown when throttle is falsy
            const mockConfigService = {
                get: jest.fn((key: string) => {
                    if (key === 'throttle') {
                        return undefined; // Missing throttle config
                    }
                    return null;
                }),
            } as unknown as ConfigService;

            expect(() => throttlerModuleFactory(mockConfigService)).toThrow(
                'Throttle configuration not found. Ensure ConfigModule is properly configured.',
            );
        });

        it('should configure logger with prettyPrint when enabled', () => {
            // Test branch coverage: prettyPrint transport assignment
            const mockConfigService = {
                get: jest.fn((key: string) => {
                    if (key === 'logging') {
                        return {
                            level: 'debug',
                            prettyPrint: true,
                        };
                    }
                    return null;
                }),
            } as unknown as ConfigService;

            const result = loggerModuleFactory(mockConfigService);
            expect(result.pinoHttp.transport).toBeDefined();
            expect(result.pinoHttp.transport?.target).toBe('pino-pretty');
        });

        it('should configure logger without transport when prettyPrint is disabled', () => {
            // Test branch coverage: prettyPrint false branch
            const mockConfigService = {
                get: jest.fn((key: string) => {
                    if (key === 'logging') {
                        return {
                            level: 'info',
                            prettyPrint: false,
                        };
                    }
                    return null;
                }),
            } as unknown as ConfigService;

            const result = loggerModuleFactory(mockConfigService);
            expect(result.pinoHttp.transport).toBeUndefined();
        });
    });
});
