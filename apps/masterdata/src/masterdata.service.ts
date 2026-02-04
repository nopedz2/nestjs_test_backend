import { Injectable } from '@nestjs/common';

@Injectable()
export class MasterdataService {
  getHello(): string {
    return 'Hello World!';
  }
}
