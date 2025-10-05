import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { helmetConfig } from './config/helmet.config';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    // Apply security middleware
    app.use(helmet(helmetConfig));

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error: Error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
