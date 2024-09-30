import { Body, Controller, Get, Post, Render, UseGuards } from '@nestjs/common'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { InjectRepository } from '@nestjs/typeorm'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'
import { Repository } from 'typeorm'
import { UnmatchedPathDto } from './dto/unmatchedPath.dto'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('unmatchedPath')
export class UnmatchedPathsController {
  constructor(
    private readonly unmatchedPathService: UnmatchedPathsService,
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
  ) {}

  @Get('userId')
  async test(@CurrentUser() user) {
    console.log('userId 획득')
    return user
  }

  @Get('getUser')
  async getUserInfo(@CurrentUser() user) {
    const userId = user.id
    return await this.unmatchedPathService.getUserInfo(userId)
  }

  @Post('changeMode')
  async changMode(@CurrentUser() user) {
    const userId = user.id
    return await this.unmatchedPathService.changeMode(userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Render('map')
  map() {
    return
  }

  @Post()
  async createUnmatchedPath(
    @Body() unmatchedPathDto: UnmatchedPathDto,
    @CurrentUser() user,
  ) {
    const userId = user.id
    return await this.unmatchedPathService.createUnmatchedPath(
      unmatchedPathDto,
      userId,
    )
  }

  @Post('setDes')
  async updateUnmatchedPath(@Body() body: string[], @CurrentUser() user) {
    const userId = user.id
    return await this.unmatchedPathService.updateUnmatchedPath(body, userId)
  }

  @Post('setMatching')
  async setMatching(@CurrentUser() user) {
    return await this.unmatchedPathService.setMatching(user)
  }
}
