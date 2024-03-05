import { KakaoMobilityService } from './../common/kakaoMobilityService/kakao.mobility.service'
import { UserEntity } from './../users/users.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { getConnection, Repository, Transaction } from 'typeorm'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'
import { UnmatchedPathDto } from './dto/unmatchedPath.dto'

@Injectable()
export class UnmatchedPathsService {
  constructor(
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly kakaoMobilityService: KakaoMobilityService,
  ) {}

  async createUnmatchedPath(
    unmatchedPathDto: UnmatchedPathDto,
    userId,
  ): Promise<any> {
    const user = await this.userRepository.findOne(userId)
    if (user.unmatchedPath !== undefined) {
      const target = await this.unmatchedPathRepository.findOne(
        user.unmatchedPath,
      )
      target.startingPoint = {
        lat: unmatchedPathDto.lat,
        lng: unmatchedPathDto.lng,
      }
      const savedTarget = await this.unmatchedPathRepository.save(target)

      return savedTarget
    } else {
      const unmatchedPath = await this.unmatchedPathRepository.create({
        startingPoint: {
          lat: unmatchedPathDto.lat,
          lng: unmatchedPathDto.lng,
        },
      })

      const savedUnmatchedPath = await this.unmatchedPathRepository.save(
        unmatchedPath,
      )

      user.unmatchedPath = savedUnmatchedPath
      await this.userRepository.save(user)

      return savedUnmatchedPath
    }
  }

  async updateUnmatchedPath(body, userId) {
    const user = await this.userRepository.findOne(userId)
    const target = await this.unmatchedPathRepository.findOne(
      user.unmatchedPath,
    )
    target.destinationPoint = {
      lat: body.lat,
      lng: body.lng,
    }
    const savedTarget = await this.unmatchedPathRepository.save(target)

    console.log(
      typeof savedTarget.startingPoint.lat,
      typeof savedTarget.startingPoint.lng,
    )
    console.log(
      typeof savedTarget.destinationPoint.lat,
      typeof savedTarget.destinationPoint.lng,
    )
    console.log('출발지lat:', savedTarget.startingPoint.lat)
    console.log('출발지lng:', savedTarget.startingPoint.lng)
    console.log('목적지lat:', savedTarget.destinationPoint.lat)
    console.log('목적지lng:', savedTarget.destinationPoint.lng)
    const kakaoResponse = await this.kakaoMobilityService.getInfo(
      savedTarget.startingPoint.lat,
      savedTarget.startingPoint.lng,
      savedTarget.destinationPoint.lat,
      savedTarget.destinationPoint.lng,
    )
    savedTarget.fare = kakaoResponse.fare.taxi
    savedTarget.distance = Math.floor(kakaoResponse.distance / 1000)
    savedTarget.time = Math.floor(kakaoResponse.duration / 60)

    const reSavedTarget = await this.unmatchedPathRepository.save(savedTarget)
    user.unmatchedPath = reSavedTarget
    await this.userRepository.save(user)

    return reSavedTarget
  }

  async setMatching(user) {
    const targetUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
      .where('user.id = :userId', { userId: user.id })
      .getOne()

    const targetUnmatchedPath = await this.unmatchedPathRepository.findOne(
      targetUser.unmatchedPath.id,
    )

    targetUnmatchedPath.userIdArray = []

    async function fetchUnmatchedPaths(userId) {
      const queryBuilder = getConnection()
        .getRepository(UserEntity)
        .createQueryBuilder('user')
        .leftJoin('user.unmatchedPath', 'unmatchedPath')
        .where(
          '(unmatchedPath.id IS NULL OR unmatchedPath.id <> :userId) AND user.id <> :userId',
          {
            // 수정된 부분
            userId,
          },
        )
        .getMany()

      const userArray = await queryBuilder

      return userArray
    }

    console.log(user.id)
    const userArray = await fetchUnmatchedPaths(user.id)
    console.log('userArray:', userArray)

    const userIdArray = userArray.map((user) => user.id)

    targetUnmatchedPath.userIdArray.push(...userIdArray)

    const savedTargetUnmatchedPath =
      this.unmatchedPathRepository.save(targetUnmatchedPath)
    return savedTargetUnmatchedPath
  }
}
