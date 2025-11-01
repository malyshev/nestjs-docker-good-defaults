import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AppService {
    constructor(private readonly logger: Logger) {}

    getHello(): string {
        this.logger.log('Service: Generating Hello World message', { context: AppService.name });
        this.logger.debug('Service: Debug log in getHello method', { context: AppService.name });
        return 'Hello World!';
    }
}
