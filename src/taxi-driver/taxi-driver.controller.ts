import { Controller, Get, Post, Render, UseGuards } from '@nestjs/common'
import { TaxiDriverService } from './taxi-driver.service'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'

@UseGuards(JwtAuthGuard)
@Controller('driver')
export class TaxiDriverController {
  @Get()
  @Render('mapForDriver')
  driver() {
    return
  }
}
