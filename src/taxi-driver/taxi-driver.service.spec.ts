import { Test, TestingModule } from '@nestjs/testing';
import { TaxiDriverService } from './taxi-driver.service';

describe('TaxiDriverService', () => {
  let service: TaxiDriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxiDriverService],
    }).compile();

    service = module.get<TaxiDriverService>(TaxiDriverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
