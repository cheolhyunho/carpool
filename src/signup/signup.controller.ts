import { RequestDto } from './signup.request.dto'
import { SignupService } from './signup.service'
import { UserLogInDTO } from 'src/users/dtos/user-login.dto'
import { Body, Controller, Get, Post, Redirect, Render } from '@nestjs/common'

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Get()
  @Render('signup')
  tmp() {
    return
  }

  @Post('login')
  async loginUser(@Body() userloginDto: UserLogInDTO) {
    return await this.signupService.loginUser(userloginDto)
  }

  @Post()
  async createUser(@Body() requestDto: RequestDto) {
    return await this.signupService.createUser(requestDto)
  }
}
