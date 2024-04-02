import { MatchedPathDto } from './dto/matchedPath.dto'
import {
  Body,
  Controller,
  Get,
  Injectable,
  Post,
  Render,
  UseGuards,
} from '@nestjs/common'
import { MatchedPathsService } from './matched-paths.service'
import { InjectRepository } from '@nestjs/typeorm'
import { UnmatchedPathEntity } from 'src/unmatched-paths/unmatchedpaths.entity'
import { MatchedPathEntity } from './matchedPaths.entity'
import { Repository } from 'typeorm'
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

  @Get('/')
  @Render('home')
  async matched(@CurrentUser() user) {
    await this.matchedPathsService.completedPay(user)
  }
}
