import { JwtAuthGuard } from './../users/jwt/jwt.guard'
import { Controller, Get, Post, Render, UseGuards } from '@nestjs/common'
import { UnmatchedPathsService } from './unmatched-paths.service'

@UseGuards(JwtAuthGuard)
@Controller('unmatched-paths')
export class UnmatchedPathsController {
  constructor(private readonly unmatchedPathService: UnmatchedPathsService) {}

  @Get()
  @Render('index')
  test() {
    return { message: 'hello' }
  }
}
