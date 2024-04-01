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

  // async reqMatching(arg) {
  //   const currentUser = await this.userRepository
  //     .createQueryBuilder('user')
  //     .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
  //     .where('user.id = :userId', {
  //       userId: arg.currentUserId,
  //     })
  //     .getOne()
  //   const matchedUser = await this.userRepository
  //     .createQueryBuilder('user')
  //     .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
  //     .where('user.id = :userId', {
  //       userId: arg.matchedUserId,
  //     })
  //     .getOne()

  //   const currentUserUP = await this.unmatchedPathRepository.findOne(
  //     currentUser.unmatchedPath.id,
  //   )
  //   const matchedUserUP = await this.unmatchedPathRepository.findOne(
  //     matchedUser.unmatchedPath.id,
  //   )

  //   const kakaoResponse1 = await this.kakaoMobilityService.getInfo(
  //     currentUserUP.startingPoint.lat,
  //     currentUserUP.startingPoint.lng,
  //     currentUserUP.destinationPoint.lat,
  //     currentUserUP.destinationPoint.lng,
  //   )

  //   const kakaoResponse2 = await this.kakaoMobilityService.getInfo(
  //     matchedUserUP.startingPoint.lat,
  //     matchedUserUP.startingPoint.lng,
  //     matchedUserUP.destinationPoint.lat,
  //     matchedUserUP.destinationPoint.lng,
  //   )
  // }

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

  async completedPay(user) {
    user.isMatching = true
    this.userRepository.save(user)
  }
}
