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
      console.log('savedUnmatchedPath.id:', savedUnmatchedPath.id)
      user.unmatchedPath = savedUnmatchedPath
      console.log('user.unmatchedPath.id:', user.unmatchedPath.id)
      await this.userRepository.save(user)

      return savedUnmatchedPath
    }
  }

  async updateUnmatchedPath(body, userId) {
    // const user = await this.userRepository.findOne(userId)
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
      .where('user.id = :userId', {
        userId: userId,
      })
      .getOne()

    const target = await this.unmatchedPathRepository.findOne(
      user.unmatchedPath.id,
    )
    console.log('target.id:', target.id)
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
    savedTarget.fare = kakaoResponse.summary.fare.taxi
    savedTarget.distance = Math.floor(kakaoResponse.summary.distance / 1000)
    savedTarget.time = Math.floor(kakaoResponse.summary.duration / 60)

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

    const compareUnmatchedPaths = []

    for (let i = 0; i < targetUnmatchedPath.userIdArray.length; i++) {
      const matchedUserId = targetUnmatchedPath.userIdArray[i]
      const matchedUser = await this.userRepository.findOne(matchedUserId, {
        relations: ['unmatchedPath'],
      })

      const compareUnmatchedPath = matchedUser.unmatchedPath
      console.log('compare:', compareUnmatchedPath)

      try {
        const kakaoResponse = await this.kakaoMobilityService.getInfo(
          targetUnmatchedPath.destinationPoint.lat,
          targetUnmatchedPath.destinationPoint.lng,
          compareUnmatchedPath.destinationPoint.lat,
          compareUnmatchedPath.destinationPoint.lng,
        )

        // 104 에러가 발생했을 때 또는 kakaoResponse.distance가 10000 미만일 때 compareUnmatchedPath를 추가
        if (kakaoResponse.summary.distance < 10000) {
          compareUnmatchedPaths.push(compareUnmatchedPath)
        }
      } catch (error) {
        compareUnmatchedPaths.push(compareUnmatchedPath)
      }
      console.log('목적지 반경 10km 이내 ', compareUnmatchedPaths)
    }

    const minFareArray = []

    for (let i = 0; i < compareUnmatchedPaths.length; i++) {
      let minFare = 99999999999999
      let kakaoWaypointResponse =
        await this.kakaoMobilityService.getWaypointInfo(
          targetUnmatchedPath.startingPoint.lat,
          targetUnmatchedPath.startingPoint.lng,
          compareUnmatchedPaths[i].startingPoint.lat,
          compareUnmatchedPaths[i].startingPoint.lng,
          targetUnmatchedPath.destinationPoint.lat,
          targetUnmatchedPath.destinationPoint.lng,
          compareUnmatchedPaths[i].destinationPoint.lat,
          compareUnmatchedPaths[i].destinationPoint.lng,
        )
      if (kakaoWaypointResponse.summary.fare.taxi < minFare) {
        minFare = kakaoWaypointResponse.summary.fare.taxi
      }

      console.log('첫번째case:', minFare)

      kakaoWaypointResponse = await this.kakaoMobilityService.getWaypointInfo(
        compareUnmatchedPaths[i].startingPoint.lat,
        compareUnmatchedPaths[i].startingPoint.lng,
        targetUnmatchedPath.startingPoint.lat,
        targetUnmatchedPath.startingPoint.lng,
        targetUnmatchedPath.destinationPoint.lat,
        targetUnmatchedPath.destinationPoint.lng,
        compareUnmatchedPaths[i].destinationPoint.lat,
        compareUnmatchedPaths[i].destinationPoint.lng,
      )

      if (kakaoWaypointResponse.summary.fare.taxi < minFare) {
        minFare = kakaoWaypointResponse.summary.fare.taxi
      }

      console.log('두번째case:', minFare)

      kakaoWaypointResponse = await this.kakaoMobilityService.getWaypointInfo(
        targetUnmatchedPath.startingPoint.lat,
        targetUnmatchedPath.startingPoint.lng,
        compareUnmatchedPaths[i].startingPoint.lat,
        compareUnmatchedPaths[i].startingPoint.lng,
        compareUnmatchedPaths[i].destinationPoint.lat,
        compareUnmatchedPaths[i].destinationPoint.lng,
        targetUnmatchedPath.destinationPoint.lat,
        targetUnmatchedPath.destinationPoint.lng,
      )
      if (kakaoWaypointResponse.summary.fare.taxi < minFare) {
        minFare = kakaoWaypointResponse.summary.fare.taxi
      }

      console.log('세번째case:', minFare)

      kakaoWaypointResponse = await this.kakaoMobilityService.getWaypointInfo(
        compareUnmatchedPaths[i].startingPoint.lat,
        compareUnmatchedPaths[i].startingPoint.lng,
        targetUnmatchedPath.startingPoint.lat,
        targetUnmatchedPath.startingPoint.lng,
        compareUnmatchedPaths[i].destinationPoint.lat,
        compareUnmatchedPaths[i].destinationPoint.lng,
        targetUnmatchedPath.destinationPoint.lat,
        targetUnmatchedPath.destinationPoint.lng,
      )
      if (kakaoWaypointResponse.summary.fare.taxi < minFare) {
        minFare = kakaoWaypointResponse.summary.fare.taxi
      }
      console.log('네번째case:', minFare)
      minFareArray.push(minFare)
      console.log('minFare:Array:', minFareArray)
    }
    const minFareAll = Math.min(...minFareArray)
    const minIndex = minFareArray.indexOf(minFareAll)

    console.log(compareUnmatchedPaths[minIndex])

    return compareUnmatchedPaths[minIndex]
  }
}
