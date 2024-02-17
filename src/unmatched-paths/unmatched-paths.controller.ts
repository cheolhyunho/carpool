import { JwtAuthGuard } from './../users/jwt/jwt.guard'
import { Body, Controller, Get, Post, Render, UseGuards } from '@nestjs/common'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { UnmatchedPathDto } from './dto/unmatchedPath.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'
import { Repository } from 'typeorm'
@Controller('unmatchedPath')
export class UnmatchedPathsController {
  constructor(
    private readonly unmatchedPathService: UnmatchedPathsService,
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
  ) {}

  @Post()
  async createUnmatchedPath(@Body() unmatchedPathDto: UnmatchedPathDto) {
    return await this.unmatchedPathService.createUnmatchedPath(unmatchedPathDto)
  }
}
