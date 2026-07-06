import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { CoreServiceModule } from './core-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(CoreServiceModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.CORE_SERVICE_HOST ?? '127.0.0.1',
      port: Number(process.env.CORE_SERVICE_PORT ?? 4000),
    },
  });

  await app.listen();
  console.log(
    `Core Service is listening on ${process.env.CORE_SERVICE_HOST ?? '127.0.0.1'}:${process.env.CORE_SERVICE_PORT ?? 4000}`,
  );
}
bootstrap();
