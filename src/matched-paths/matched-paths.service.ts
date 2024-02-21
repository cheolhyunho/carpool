import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MatchedPathEntity } from './matchedPaths.entity'
import { Repository } from 'typeorm'
import { UserEntity } from 'src/users/users.entity'

@Injectable()
export class MatchedPathsService {
  constructor(
    @InjectRepository(MatchedPathEntity)
    private readonly matchedPathRepository: Repository<MatchedPathEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createMatchedPath(matchedPathDto: any, userId) {
    const matchedPath = await this.matchedPathRepository.create({
      origin: matchedPathDto.origin,

      waypoint1: matchedPathDto.waypoint1,

      waypoint2: matchedPathDto.waypoint2,

      destination: matchedPathDto.destination,

      lessFare: 0,

      moreFare: 1,

      lessDuration: 2,

      moreDuration: 3,

      isReal: true,
    })
    const savedMatchedPath = await this.matchedPathRepository.save(matchedPath)

    const user = await this.userRepository.findOne(userId)

    user.matchedPath = matchedPath
    await this.userRepository.save(user)

    return savedMatchedPath
  }
}
