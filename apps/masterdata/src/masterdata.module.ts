import { Module } from '@nestjs/common';
import { MasterdataController } from './masterdata.controller';
import { MasterdataService } from './masterdata.service';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [DepartmentsModule],
  controllers: [MasterdataController],
  providers: [MasterdataService],
})
export class MasterdataModule {}
