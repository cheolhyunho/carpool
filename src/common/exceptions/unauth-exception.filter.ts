import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(UnauthorizedException)
export class UnauthorizedRedirectFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // 리다이렉트 경로 설정
    const redirectPath = '/login'

    response.redirect(HttpStatus.TEMPORARY_REDIRECT, redirectPath)
  }
}
