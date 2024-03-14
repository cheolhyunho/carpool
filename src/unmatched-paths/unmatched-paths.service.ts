import { TaxiDriverEntity } from './../taxi-driver/texiDrivers.entity'
import { CurrentUser } from './../common/decorators/current-user.decorator'
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

    if (kakaoResponse.result_code === 104) {
      return '출발지와 목적지의 거리는 5m를 초과해야 합니다'
    }

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

    const userArray = await this.fetchUnmatchedPaths(user.id)

    const userIdArray = userArray.map((user) => user.id)

    targetUnmatchedPath.userIdArray.push(...userIdArray)

    const savedTargetUnmatchedPath = await this.unmatchedPathRepository.save(
      targetUnmatchedPath,
    )

    let tmpArray = []
    let resultArray = []
    tmpArray = await this.pushToTmpArray(savedTargetUnmatchedPath, tmpArray)
    console.log('tmpArray:', tmpArray)
    resultArray = await this.setResultArray(
      savedTargetUnmatchedPath,
      tmpArray,
      resultArray,
    )
    const currentUserUP = targetUnmatchedPath
    const matchedUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
      .where('user.id = :userId', {
        userId: resultArray[0],
      })
      .getOne()
    if (!matchedUser) {
      return null
    }
    const matchedUserUP = await this.unmatchedPathRepository.findOne(
      matchedUser.unmatchedPath.id,
    )

    const [matchedPath, caseIndex] = await this.findMatchedCase(
      currentUserUP,
      matchedUserUP,
    )

    //택시비만 처리

    let currentFare = 0
    let matchedFare = 0
    let currentDistance = 0
    let matchedDistance = 0

    if (caseIndex === 0 || caseIndex === 3) {
      const firstDistance =
        matchedPath.sections[0].distance + matchedPath.sections[1].distance
      const secondDistance =
        matchedPath.sections[1].distance + matchedPath.sections[2].distance
      const firstFare =
        (matchedPath.summary.fare.taxi * firstDistance) /
        (firstDistance + secondDistance)
      const secondFare =
        (matchedPath.summary.fare.taxi * secondDistance) /
        (firstDistance + secondDistance)
      if (caseIndex === 0) {
        currentFare = firstFare
        matchedFare = secondFare
        currentDistance = firstDistance
        matchedDistance = secondDistance
      } else {
        currentFare = secondFare
        matchedFare = firstFare
        currentDistance = secondDistance
        matchedDistance = firstDistance
      }
    } else if (caseIndex === 1 || caseIndex === 2) {
      const longerDistance = matchedPath.summary.distance
      const shorterDistance = matchedPath.sections[2].distance
      const longerFare =
        (matchedPath.summary.fare.taxi * longerDistance) /
        (longerDistance + shorterDistance)
      const shorterFare =
        (matchedPath.summary.fare.taxi * shorterDistance) /
        (longerDistance + shorterDistance)
      if (caseIndex === 1) {
        currentFare = shorterFare
        matchedFare = longerFare
        currentDistance = shorterDistance
        matchedDistance = longerDistance
      } else {
        currentFare = longerFare
        matchedFare = shorterFare
        currentDistance = longerDistance
        matchedDistance = shorterDistance
      }
    }
    console.log(
      '나의 요금, 상대요금, 나의 거리, 상대거리 :',
      currentFare,
      matchedFare,
      currentDistance,
      matchedDistance,
    )
    //톨비 있으면 톨비까지 처리
    if (matchedPath.summary.fare.toll != 0) {
      let sectionKakaoResponse = await this.kakaoMobilityService.getInfo(
        matchedPath.summary.origin.y,
        matchedPath.summary.origin.x,
        matchedPath.summary.waypoints[0].y,
        matchedPath.summary.waypoints[0].x,
      )
      const firstSectionToll = sectionKakaoResponse.summary.fare.toll

      sectionKakaoResponse = await this.kakaoMobilityService.getInfo(
        matchedPath.summary.waypoints[0].y,
        matchedPath.summary.waypoints[0].x,
        matchedPath.summary.waypoints[1].y,
        matchedPath.summary.waypoints[1].x,
      )
      const secondSectionToll = sectionKakaoResponse.summary.fare.toll

      sectionKakaoResponse = await this.kakaoMobilityService.getInfo(
        matchedPath.summary.waypoints[1].y,
        matchedPath.summary.waypoints[1].x,
        matchedPath.summary.destination.y,
        matchedPath.summary.destination.x,
      )
      const thirdSectionToll = sectionKakaoResponse.summary.fare.toll

      if (secondSectionToll != 0) {
        currentFare += secondSectionToll / 2
        matchedFare += secondSectionToll / 2
      }

      if (caseIndex == 0) {
        currentFare += firstSectionToll
        matchedFare += thirdSectionToll
      } else if (caseIndex == 1) {
        matchedFare += firstSectionToll + thirdSectionToll
      } else if (caseIndex == 2) {
        currentFare += firstSectionToll + thirdSectionToll
      } else if (caseIndex == 3) {
        currentFare += thirdSectionToll
        matchedFare += firstSectionToll
      }
    }

    console.log('톨비정산 후 각각 요금 :', currentFare, matchedFare)

    return [
      currentUserUP,
      matchedUserUP,
      matchedPath,
      currentFare,
      matchedFare,
      currentDistance,
      matchedDistance,
    ]
  }
  async fetchUnmatchedPaths(userId) {
    const queryBuilder = getConnection()
      .getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoin('user.unmatchedPath', 'unmatchedPath')
      .where(
        'unmatchedPath.id IS NOT NULL  AND user.id <> :userId AND user.socketId IS NOT NULL',
        {
          userId,
        },
      )
      .getMany()

    const userArray = await queryBuilder

    return userArray
  }

  async findMatchedCase(currentUserUP, matchedUserUP) {
    let caseIndex
    let matchedPath
    let minFare = 99999999999999

    let kakaoWaypointResponse = await this.kakaoMobilityService.getWaypointInfo(
      currentUserUP.startingPoint.lat,
      currentUserUP.startingPoint.lng,
      matchedUserUP.startingPoint.lat,
      matchedUserUP.startingPoint.lng,
      currentUserUP.destinationPoint.lat,
      currentUserUP.destinationPoint.lng,
      matchedUserUP.destinationPoint.lat,
      matchedUserUP.destinationPoint.lng,
    )
    if (
      kakaoWaypointResponse.summary.fare.taxi +
        kakaoWaypointResponse.summary.fare.toll <
      minFare
    ) {
      minFare =
        kakaoWaypointResponse.summary.fare.taxi +
        kakaoWaypointResponse.summary.fare.toll
      matchedPath = kakaoWaypointResponse
      caseIndex = 0
    }

    console.log('첫번째case:', minFare)

    kakaoWaypointResponse = await this.kakaoMobilityService.getWaypointInfo(
      matchedUserUP.startingPoint.lat,
      matchedUserUP.startingPoint.lng,
      currentUserUP.startingPoint.lat,
      currentUserUP.startingPoint.lng,
      currentUserUP.destinationPoint.lat,
      currentUserUP.destinationPoint.lng,
      matchedUserUP.destinationPoint.lat,
      matchedUserUP.destinationPoint.lng,
    )

    if (
      kakaoWaypointResponse.summary.fare.taxi +
        kakaoWaypointResponse.summary.fare.toll <
      minFare
    ) {
      minFare =
        kakaoWaypointResponse.summary.fare.taxi +
        kakaoWaypointResponse.summary.fare.toll
      matchedPath = kakaoWaypointResponse
      caseIndex = 1
    }

    console.log('두번째case:', minFare)

    kakaoWaypointResponse = await this.kakaoMobilityService.getWaypointInfo(
      currentUserUP.startingPoint.lat,
      currentUserUP.startingPoint.lng,
      matchedUserUP.startingPoint.lat,
      matchedUserUP.startingPoint.lng,
      matchedUserUP.destinationPoint.lat,
      matchedUserUP.destinationPoint.lng,
      currentUserUP.destinationPoint.lat,
      currentUserUP.destinationPoint.lng,
    )
    if (
      kakaoWaypointResponse.summary.fare.taxi +
        kakaoWaypointResponse.summary.fare.toll <
      minFare
    ) {
      minFare =
        kakaoWaypointResponse.summary.fare.taxi +
        kakaoWaypointResponse.summary.fare.toll
      matchedPath = kakaoWaypointResponse
      caseIndex = 2
    }

    console.log('세번째case:', minFare)

    kakaoWaypointResponse = await this.kakaoMobilityService.getWaypointInfo(
      matchedUserUP.startingPoint.lat,
      matchedUserUP.startingPoint.lng,
      currentUserUP.startingPoint.lat,
      currentUserUP.startingPoint.lng,
      matchedUserUP.destinationPoint.lat,
      matchedUserUP.destinationPoint.lng,
      currentUserUP.destinationPoint.lat,
      currentUserUP.destinationPoint.lng,
    )
    if (
      kakaoWaypointResponse.summary.fare.taxi +
        kakaoWaypointResponse.summary.fare.toll <
      minFare
    ) {
      minFare =
        kakaoWaypointResponse.summary.fare.taxi +
        kakaoWaypointResponse.summary.fare.toll
      matchedPath = kakaoWaypointResponse
      caseIndex = 3
    }
    console.log('네번째case:', minFare)

    return [matchedPath, caseIndex]
  }

  //  출발지 nkm 이내 배열에 담기

  async pushToTmpArray(savedTargetUnmatchedPath, tmpArray) {
    for (let i = 0; i < savedTargetUnmatchedPath.userIdArray.length; i++) {
      const targetUser = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
        .where('user.id = :userId', {
          userId: savedTargetUnmatchedPath.userIdArray[i],
        })
        .getOne()

      const targetUnmatchedPath = await this.unmatchedPathRepository.findOne(
        targetUser.unmatchedPath.id,
      )

      const kakaoResponse = await this.kakaoMobilityService.getInfo(
        savedTargetUnmatchedPath.startingPoint.lat,
        savedTargetUnmatchedPath.startingPoint.lng,
        targetUnmatchedPath.startingPoint.lat,
        targetUnmatchedPath.startingPoint.lng,
      )
      if (kakaoResponse.result_code === 104) {
        tmpArray.push(savedTargetUnmatchedPath.userIdArray[i])
        continue
      }
      if (kakaoResponse.summary.distance <= 10000) {
        tmpArray.push(savedTargetUnmatchedPath.userIdArray[i])
      }
    }
    return tmpArray
  }

  async setResultArray(savedTargetUnmatchedPath, tmpArray, resultArray) {
    for (let i = 0; i < tmpArray.length; i++) {
      if (i === 0) {
        resultArray.push(tmpArray[0])
      } else {
        // 반경 10km 이내에 있는 유저의 id 배열의 n번째 id
        const targetUser1 = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
          .where('user.id = :userId', {
            userId: tmpArray[i],
          })
          .getOne()
        const targetUnmatchedPath1 = await this.unmatchedPathRepository.findOne(
          targetUser1.unmatchedPath.id,
        )
        // 로그인한 유저와 tmpArray[i] 에 유저와의 길찾기 api 호출
        const kakaoResponse1 = await this.kakaoMobilityService.getInfo(
          savedTargetUnmatchedPath.destinationPoint.lat,
          savedTargetUnmatchedPath.destinationPoint.lng,
          targetUnmatchedPath1.destinationPoint.lat,
          targetUnmatchedPath1.destinationPoint.lng,
        )
        // resultArray 에 있는 값 === 현재까지 목적지가 가장 가까운 유저
        const targetUser2 = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
          .where('user.id = :userId', {
            userId: resultArray[0],
          })
          .getOne()
        const targetUnmatchedPath2 = await this.unmatchedPathRepository.findOne(
          targetUser2.unmatchedPath.id,
        )
        const kakaoResponse2 = await this.kakaoMobilityService.getInfo(
          savedTargetUnmatchedPath.destinationPoint.lat,
          savedTargetUnmatchedPath.destinationPoint.lng,
          targetUnmatchedPath2.destinationPoint.lat,
          targetUnmatchedPath2.destinationPoint.lng,
        )

        if (kakaoResponse2.result_code === 104) {
          break
        }
        if (kakaoResponse1.result_code === 104) {
          resultArray.splice(0, 1)
          resultArray.push(tmpArray[i])
        }
        if (kakaoResponse1.summary.distance < kakaoResponse2.summary.distance) {
          resultArray.splice(0, 1)
          resultArray.push(tmpArray[i])
        }
      }
    }
    console.log('resultArray:', resultArray)
    return resultArray
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
