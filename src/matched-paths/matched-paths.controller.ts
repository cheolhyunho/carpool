import { MatchedPathDto } from './dto/matchedPath.dto'
import { Body, Controller, Injectable, Post, UseGuards } from '@nestjs/common'
import { MatchedPathsService } from './matched-paths.service'
import { InjectRepository } from '@nestjs/typeorm'
import { UnmatchedPathEntity } from 'src/unmatched-paths/unmatchedpaths.entity'
import { MatchedPathEntity } from './matchedPaths.entity'
import { Repository } from 'typeorm'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('matchedPath')
export class MatchedPathsController {
  constructor(private readonly matchedPathsService: MatchedPathsService) {}
  @Post()
  async createMatchedPath(
    @Body() matchedPathDto: MatchedPathDto,
    @CurrentUser() user,
  ) {
    const userId = user.id
    return await this.matchedPathsService.createMatchedPath(
      matchedPathDto,
      userId,
    )
  }
}
