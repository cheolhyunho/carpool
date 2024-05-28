import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common'
import { MatchedPathsService } from './matched-paths.service'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { KakaoMobilityService } from 'src/common/kakaoMobilityService/kakao.mobility.service'

@UseGuards(JwtAuthGuard)
@Controller('matchedPath')
export class MatchedPathsController {
  constructor(
    private readonly matchedPathsService: MatchedPathsService,
    private readonly kakaoMobilityService: KakaoMobilityService,
  ) {}

  @Get()
  @Render('matched')
  async matched(@CurrentUser() user, @Query('pg_token') pgToken: string) {
    await this.matchedPathsService.completedPay({ user, pgToken })
  }
}
