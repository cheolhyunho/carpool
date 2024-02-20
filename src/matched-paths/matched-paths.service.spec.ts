import { Test, TestingModule } from '@nestjs/testing';
import { MatchedPathsService } from './matched-paths.service';

describe('MatchedPathsService', () => {
  let service: MatchedPathsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchedPathsService],
    }).compile();

    service = module.get<MatchedPathsService>(MatchedPathsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
