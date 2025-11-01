import { Controller, Get } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly logger: Logger,
    ) {}

    @Get()
    getHello(): string {
        const context = AppController.name;
        // Test logging at different levels to verify Grafana visibility
        this.logger.log('Hello World endpoint called', { context });
        this.logger.debug('Debug: Processing getHello request', { context });
        this.logger.warn('Warning: This is a test warning message', { context });
        // Note: error level logs would typically include an Error object
        this.logger.error('Error: This is a test error message', { context });

        const message = this.appService.getHello();
        this.logger.log(`Returning message: ${message}`, { context });
        return message;
    }
}
