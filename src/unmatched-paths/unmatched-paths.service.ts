import { UnmatchedPathDto } from './dto/unmatchedPath.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Transaction } from 'typeorm'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'

@Injectable()
export class UnmatchedPathsService {
  constructor(
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
  ) {}

  async createUnmatchedPath(unmatchedPathDto: UnmatchedPathDto): Promise<any> {
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

    return savedUnmatchedPath
  }
}
