import { UserEntity } from 'src/users/users.entity'
import { MatchedPathEntity } from './../matched-paths/matchedPaths.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UnmatchedPathEntity } from 'src/unmatched-paths/unmatchedpaths.entity'
import { Repository } from 'typeorm'

@Injectable()
export class TaxiDriverService {
  constructor() {}

  //   async setDriver(matchedPath) {
  //     const drivers = await this.userRepository.find({
  //       where: { isDriver: true },
  //     })
  //     for

  //   }
}
