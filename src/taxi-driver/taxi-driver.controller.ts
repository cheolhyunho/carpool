import { Controller, Post } from '@nestjs/common'
import { TaxiDriverService } from './taxi-driver.service'

@Controller('taxi-driver')
export class TaxiDriverController {
  constructor(private readonly signupService: TaxiDriverService) {}
}
