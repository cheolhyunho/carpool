import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MatchedPathEntity } from './matchedPaths.entity'
import { Repository } from 'typeorm'

@Injectable()
export class MatchedPathsService {
  constructor(
    @InjectRepository(MatchedPathEntity)
    private readonly matchedPathRepository: Repository<MatchedPathEntity>,
  ) {}

  async createMatchedPath(matchedPathDto: any): Promise<any> {
    const matchedPath = await this.matchedPathRepository.create({
      origin: matchedPathDto.origin,

      waypoint1: matchedPathDto.waypoint[0],

      waypoint2: matchedPathDto.waypoint[0],

      destination: matchedPathDto.destination,

      lessFare: 0,

      moreFare: 1,

      lessDuration: 2,

      moreDuration: 3,

      isReal: true,
    })
    const savedMatchedPath = await this.matchedPathRepository.save(matchedPath)

    return savedMatchedPath
  }
}
