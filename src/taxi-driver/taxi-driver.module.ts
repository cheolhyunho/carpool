import { Module } from '@nestjs/common'
import { TaxiDriverService } from './taxi-driver.service';
import { TaxiDriverController } from './taxi-driver.controller';

@Module({
  providers: [TaxiDriverService],
  controllers: [TaxiDriverController]
})
export class TaxiDriverModule {}
