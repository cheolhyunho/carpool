import { Body, Controller, Injectable, Post } from '@nestjs/common'
import { MatchedPathsService } from './matched-paths.service'
import { InjectRepository } from '@nestjs/typeorm'
import { UnmatchedPathEntity } from 'src/unmatched-paths/unmatchedpaths.entity'
import { MatchedPathEntity } from './matchedPaths.entity'
import { Repository } from 'typeorm'

@Controller('matchedPath')
export class MatchedPathsController {
  constructor(
    private readonly matchedPathsService: MatchedPathsService,
    @InjectRepository(MatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<MatchedPathEntity>,
  ) {}
  @Post()
  async createMatchedPath(@Body() matchedPathDto: any) {
    return await this.matchedPathsService.createMatchedPath(matchedPathDto)
  }
}
