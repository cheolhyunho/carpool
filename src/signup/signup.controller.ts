import { RequestDto } from './signup.request.dto'
import { Body, Controller, Get, Post, Render } from '@nestjs/common'
import { SignupService } from './signup.service'

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Get()
  @Render('signup')
  tmp() {
    return
  }

  @Post()
  async createUser(@Body() requestDto: RequestDto) {
    return await this.signupService.createUser(requestDto)
  }
}
