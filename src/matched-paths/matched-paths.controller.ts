import { Controller, Get, Query, Render, UseGuards } from '@nestjs/common'
import { MatchedPathsService } from './matched-paths.service'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('matchedPath')
export class MatchedPathsController {
  constructor(private readonly matchedPathsService: MatchedPathsService) {}

  @Get()
  @Render('matched')
  async matched(@CurrentUser() user, @Query('pg_token') pgToken: string) {
    await this.matchedPathsService.completedPay({ user, pgToken })
  }
}
