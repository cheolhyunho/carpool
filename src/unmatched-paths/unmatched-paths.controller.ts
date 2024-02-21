import { Body, Controller, Get, Post, Render, UseGuards } from '@nestjs/common'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { InjectRepository } from '@nestjs/typeorm'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'
import { Repository } from 'typeorm'
import { UnmatchedPathDto } from './dto/unmatchedPath.dto'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'
@Controller('unmatchedPath')
export class UnmatchedPathsController {
  constructor(
    private readonly unmatchedPathService: UnmatchedPathsService,
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Render('map')
  map() {
    return
  }

  @Post()
  async createUnmatchedPath(@Body() unmatchedPathDto: UnmatchedPathDto) {
    return await this.unmatchedPathService.createUnmatchedPath(unmatchedPathDto)
  }
}
