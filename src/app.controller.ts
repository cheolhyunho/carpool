import { Controller, Get, Render, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from './users/jwt/jwt.guard'

@Controller('/')
export class AppController {
  @Get()
  @Render('login')
  test() {
    return
  }

  @Get('home')
  @Render('map')
  home() {
    return
  }
}
