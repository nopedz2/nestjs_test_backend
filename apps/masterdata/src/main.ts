import { NestFactory } from '@nestjs/core';
import { MasterdataModule } from './masterdata.module';

async function bootstrap() {
  const app = await NestFactory.create(MasterdataModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
