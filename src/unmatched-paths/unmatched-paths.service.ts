import { UserEntity } from './../users/users.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Transaction } from 'typeorm'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'
import { UnmatchedPathDto } from './dto/unmatchedPath.dto'

@Injectable()
export class UnmatchedPathsService {
  constructor(
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUnmatchedPath(
    unmatchedPathDto: UnmatchedPathDto,
    userId,
  ): Promise<any> {
    console.log(unmatchedPathDto.lat)
    console.log(unmatchedPathDto.lng)

    const unmatchedPath = await this.unmatchedPathRepository.create({
      startingPoint: unmatchedPathDto.lat,
      destinationPoint: unmatchedPathDto.lng,
      fare: 1,
      distance: 2,
      time: 3,
    })

    const savedUnmatchedPath = await this.unmatchedPathRepository.save(
      unmatchedPath,
    )

    const user = await this.userRepository.findOne(userId)


    user.unmatchedPath = savedUnmatchedPath
    await this.userRepository.save(user)

    return savedUnmatchedPath
  }
}
