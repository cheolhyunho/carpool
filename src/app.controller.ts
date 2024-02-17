import { Controller, Get, Render } from '@nestjs/common'

@Controller('/')
export class AppController {
  @Get()
  @Render('login')
  test() {
    return
  }

  @Get('home')
  @Render('home')
  test1() {
    return
  }
}
