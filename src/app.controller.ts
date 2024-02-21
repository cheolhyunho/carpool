import {
  Controller,
  Get,
  Render,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { JwtAuthGuard } from './users/jwt/jwt.guard'
import { OnlyPrivateInterceptor } from './common/interceptors/only-private.interceptor'
import { CurrentUser } from './common/decorators/current-user.decorator'
import { UserEntity } from './users/users.entity'


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

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(OnlyPrivateInterceptor)
  async getCurrentUser(@CurrentUser() currentUser: any) {
    return currentUser
  }
}
