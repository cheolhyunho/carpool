import { Controller, Get, Render } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  @Render('map')
  test() {
    return { message: '1' }
  }
}
