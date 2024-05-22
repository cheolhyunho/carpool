import {
  Controller,
  Get,
  Render,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { JwtAuthGuard } from './users/jwt/jwt.guard'
import { OnlyPrivateInterceptor } from './common/interceptors/only-private.interceptor'
import { CurrentUser } from './common/decorators/current-user.decorator'
import { Response, Request } from 'express'
import { join } from 'path'
import { UserEntity } from './users/users.entity'

@Controller('/')
export class AppController {
  @Get()
  async redirectToHome(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // 여기에서 jwt 쿠키의 존재 여부를 확인하고, 있다면 '/home'으로 리다이렉트
    const jwtCookie = request.cookies['jwt']

    console.log(jwtCookie)

    if (jwtCookie) {
      response.redirect('/unmatchedPath')
    } else {
      response.redirect('/login')
    }
  }

  @Get('login')
  @Render('login')
  login() {
    return
  }

  @Get('driver')
  @Render('mapForDriver')
  waitingDriver() {
    return
  }

  @UseGuards(JwtAuthGuard)
  @Get('home')
  @Render('map')
  home() {
    return
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(OnlyPrivateInterceptor)
  async getCurrentUser(@CurrentUser() currentUser: any) {
    return currentUser
  }
}
