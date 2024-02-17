import { JwtAuthGuard } from './../users/jwt/jwt.guard'
import { Body, Controller, Get, Post, Render, UseGuards } from '@nestjs/common'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { UnmatchedPathDto } from './dto/unmatchedPath.dto'

@Controller('unmatchedPath')
export class UnmatchedPathsController {
  constructor(private readonly unmatchedPathService: UnmatchedPathsService) {}

  @Post()
  async createUnmatchedPath(@Body() unmatchedPathDto: UnmatchedPathDto) {
    return await this.unmatchedPathService.createUnmatchedPath(unmatchedPathDto)
  }
}
