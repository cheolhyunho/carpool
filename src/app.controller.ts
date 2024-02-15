import { Controller, Get, Render } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('/signup')
  @Render('signup')
  test() {
    return { message: '' }
  }
}
