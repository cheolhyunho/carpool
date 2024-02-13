import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'

@Injectable()
export class UnmatchedPathsService {
  constructor(
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
  ) {}
}
