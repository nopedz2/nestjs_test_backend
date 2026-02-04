import { Test, TestingModule } from '@nestjs/testing';
import { MasterdataController } from './masterdata.controller';
import { MasterdataService } from './masterdata.service';

describe('MasterdataController', () => {
  let masterdataController: MasterdataController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MasterdataController],
      providers: [MasterdataService],
    }).compile();

    masterdataController = app.get<MasterdataController>(MasterdataController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(masterdataController.getHello()).toBe('Hello World!');
    });
  });
});
