import { Module } from '@nestjs/common';
import { MasterdataController } from './masterdata.controller';
import { MasterdataService } from './masterdata.service';

@Module({
  imports: [],
  controllers: [MasterdataController],
  providers: [MasterdataService],
})
export class MasterdataModule {}
