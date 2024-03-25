import { Controller, Post } from '@nestjs/common'
import { TaxiDriverService } from './taxi-driver.service'

@Controller('taxi-driver')
export class TaxiDriverController {
  constructor(private readonly taxiDriver: TaxiDriverService) {}

  @Post()
  async setDriver() {
    // await this.taxiDriver.setDriver(matchedPath)
  }
}
