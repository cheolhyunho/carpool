import { UnmatchedPathEntity } from 'src/unmatched-paths/unmatchedpaths.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MatchedPathEntity } from './matchedPaths.entity'
import { Repository } from 'typeorm'
import { UserEntity } from 'src/users/users.entity'
import { KakaoMobilityService } from 'src/common/kakaoMobilityService/kakao.mobility.service'

@Injectable()
export class MatchedPathsService {
  constructor(
    @InjectRepository(MatchedPathEntity)
    private readonly matchedPathRepository: Repository<MatchedPathEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
    private readonly kakaoMobilityService: KakaoMobilityService,
  ) {}

  async createMatchedPath(
    matchedPathdto: any,
    currentFare,
    matchedFare,
    user,
    oppUser,
  ) {
    const matchedPath = await this.matchedPathRepository.create({
      origin: {
        lat: matchedPathdto.summary.origin.y,
        lng: matchedPathdto.summary.origin.x,
      },
      destinationPoint: {
        lat: matchedPathdto.summary.destination.y,
        lng: matchedPathdto.summary.destination.x,
      },
      firstWayPoint: {
        lat: matchedPathdto.summary.waypoints[0].y,
        lng: matchedPathdto.summary.waypoints[0].x,
      },
      secondWayPoint: {
        lat: matchedPathdto.summary.waypoints[1].y,
        lng: matchedPathdto.summary.waypoints[1].x,
      },

      firstFare: currentFare,

      secondFare: matchedFare,

      totalDistance: matchedPathdto.summary.distance,

      totalDuration: matchedPathdto.summary.duration,

      users: [user, oppUser],
    })
    const savedMatchedPath = await this.matchedPathRepository.save(matchedPath)

    return savedMatchedPath
  }

  async completedPay(payload) {
    const user = payload.user
    const token = payload.pgToken
    user.isMatching = true
    user.pgToken = token

    this.userRepository.save(user)
  }
}
