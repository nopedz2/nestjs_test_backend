import { Controller, Get } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';

@Controller()
export class MasterdataController {
  constructor(private readonly masterdataService: MasterdataService) {}

  @Get()
  getHello(): string {
    return this.masterdataService.getHello();
  }
}
