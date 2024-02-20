import { Test, TestingModule } from '@nestjs/testing';
import { MatchedPathsController } from './matched-paths.controller';

describe('MatchedPathsController', () => {
  let controller: MatchedPathsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchedPathsController],
    }).compile();

    controller = module.get<MatchedPathsController>(MatchedPathsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
