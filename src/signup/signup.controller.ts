import { RequestDto } from './signup.request.dto'
import { SignupService } from './signup.service'
import { UserLogInDTO } from 'src/users/dtos/user-login.dto'
import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Res,
  UseInterceptors,
} from '@nestjs/common'
import { Response } from 'express'
import { OnlyPrivateInterceptor } from 'src/common/interceptors/only-private.interceptor'

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Get()
  @Render('signup')
  tmp() {}

  @Post('login')
  async logIn(
    @Body() userLoginDTO: UserLogInDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { jwt, user } = await this.signupService.verifyUserAndSignJwt(
      userLoginDTO.email,
      userLoginDTO.password,
    )
    response.cookie('jwt', jwt, { httpOnly: true })
    return user
  }

  @Get('logout')
  async logOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt', { httpOnly: true, path: '/' })
    return
  }

  @Post()
  async createUser(@Body() requestDto: RequestDto) {
    return await this.signupService.createUser(requestDto)
  }
}
