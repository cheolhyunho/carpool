import { Test, TestingModule } from '@nestjs/testing';
import { TaxiDriverController } from './taxi-driver.controller';

describe('TaxiDriverController', () => {
  let controller: TaxiDriverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxiDriverController],
    }).compile();

    controller = module.get<TaxiDriverController>(TaxiDriverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
