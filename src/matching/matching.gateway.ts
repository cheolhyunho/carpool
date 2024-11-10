import { Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { UnmatchedPathsService } from 'src/unmatched-paths/unmatched-paths.service'
import { UserEntity } from 'src/users/users.entity'
import { Repository } from 'typeorm'
import { Socket } from 'socket.io'
import { MatchedPathEntity } from '../matched-paths/matchedPaths.entity'
import { MatchedPathsService } from '../matched-paths/matched-paths.service'
import { EntityManager } from 'typeorm'
import { KakaoMobilityService } from 'src/common/kakaoMobilityService/kakao.mobility.service'

@WebSocketGateway()
export class MatchingGateway implements OnGatewayDisconnect {
  constructor(
    private readonly unmatchedPathService: UnmatchedPathsService,
    private readonly matchedPathService: MatchedPathsService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MatchedPathEntity)
    private readonly matchedPathRepository: Repository<MatchedPathEntity>,
    private readonly entityManager: EntityManager,
    private readonly kakaoMobilityService: KakaoMobilityService,
  ) {}

  private logger = new Logger('gateway')
  @SubscribeMessage('driverMode')
  async handleDriverMode(
    @ConnectedSocket() socket: Socket,
    @MessageBody() user,
  ) {
    const currentUser = await this.userRepository.findOne(user.id)
    currentUser.socketId = socket.id
    currentUser.isDriver = true
    await this.userRepository.save(currentUser)
  }
  isAlreadySentMap = new Map()

  @SubscribeMessage('doMatch')
  async handleSocket(@ConnectedSocket() socket: Socket, @MessageBody() body) {
    const user = await this.userRepository.findOne({
      where: { id: body.id },
      relations: ['unmatchedPath', 'matchedPath'],
    })
    if (
      user.unmatchedPath === null ||
      user.unmatchedPath === undefined ||
      user.unmatchedPath.destinationPoint === null
    ) {
      socket.emit('noUnmatchedPath')
      return
    }
    user.socketId = socket.id
    user.isDriver = false
    user.isMatching = false
    user.matchedPath = null
    user.pgToken = null
    await this.userRepository.save(user)

    let response = null
    let matchFound = false
    //테스트시에 주석처리
    await this.unmatchedPathService.sleep(5000)

    const startTime = Date.now()
    while (!matchFound) {
      response = await this.unmatchedPathService.setMatching(user)
      if (response !== null) {
        matchFound = true
      } else {
        console.log('대기중')
        await this.unmatchedPathService.sleep(1000)
      }
      if (Date.now() - startTime > 60000) {
        break // 30초가 넘었다면 반복문 종료
      }
    }
    if (Date.now() - startTime <= 60000) {
      const matchedUserUP = response.matchedUserUP
      const oppUser = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
        .leftJoinAndSelect('user.matchedPath', 'matchedPath')
        .where('unmatchedPath.id = :unmatchedPathId', {
          unmatchedPathId: matchedUserUP.id,
        })
        .getOne()

      if (
        oppUser.matchedPath == null &&
        !this.isAlreadySentMap.get(response.matchedPath.summary.origin.x) &&
        response.currentFare < response.currentUserUP.fare &&
        response.matchedFare < response.matchedUserUP.fare
      ) {
        this.isAlreadySentMap.set(response.matchedPath.summary.origin.x, true)

        await this.matchedPathService.createMatchedPath(
          response.matchedPath,
          response.currentFare,
          response.matchedFare,
          user,
          oppUser,
        )

        socket.emit('matching', {
          ...response,
          username: user.username,
          oppname: `${oppUser.username[0]}*${oppUser.username.slice(2)}`,
        })
        let temp = response.currentUserUP
        response.currentUserUP = response.matchedUserUP
        response.matchedUserUP = temp
        temp = response.currentFare
        response.currentFare = response.matchedFare
        response.matchedFare = temp
        temp = response.currentDistance
        response.currentDistance = response.matchedDistance
        response.matchedDistance = temp
        response.caseIndex = 3 - response.caseIndex

        socket.to(oppUser.socketId).emit('matching', {
          ...response,
          username: oppUser.username,
          oppname: `${user.username[0]}*${user.username.slice(2)}`,
        })
      }

      const updateUser = await this.userRepository.findOne({
        where: { id: body.id },
        relations: ['matchedPath'],
      })

      if (updateUser.matchedPath == null) {
        console.log('Map', this.isAlreadySentMap)
        this.isAlreadySentMap.set(response.matchedPath.summary.origin.x, false)
        socket.emit('oppAlreadyMatched')
      }
    } else {
      socket.emit('noPeople')
    }
  }

  async sendWantLocationEvent(matchedPath, socket) {
    const drivers = await this.userRepository.find({
      where: { isDriver: true },
    })

    console.log('운행중인 모든 드라이버', drivers)
    for (const driver of drivers) {
      console.log('wantLocation 이벤트 실행중', driver)
      socket.to(driver.socketId).emit('wantLocation', matchedPath)
    }
    // const driver = await this.userRepository.findOne({
    //   where: { isDriver: true, isMatching: false },
    // })
    // console.log('운행중인 모든 드라이버', driver)
    // driver.isMatching = true
    // await this.userRepository.save(driver)
    // socket.to(driver.socketId).emit('wantLocation', matchedPath)
  }

  @SubscribeMessage('accept')
  async handleAccept(@ConnectedSocket() socket: Socket, @MessageBody() user) {
    user.socketId = socket.id
    user.isMatching = true
    await this.userRepository.save(user)
    const targetUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.matchedPath', 'matchedPath')
      .where('user.id = :userId', {
        userId: user.id,
      })
      .getOne()
    console.log('타겟유저:', targetUser.matchedPath)

    let matchedPath = await this.matchedPathRepository
      .createQueryBuilder('matchedPath')
      .leftJoinAndSelect('matchedPath.users', 'users')
      .where('matchedPath.id = :id', { id: targetUser.matchedPath.id })
      .orderBy('users.id', 'ASC')
      .getOne()

    const otherUser = matchedPath.users.find(
      (oppUser) => oppUser.id !== user.id,
    )

    let isAccepted = false
    //수락대기 경과시간
    let elapsedTime = 0
    //수락대기 최대시간
    const timeoutLimit = 60
    while (!isAccepted && elapsedTime < timeoutLimit) {
      if (
        matchedPath.users[0]?.isMatching &&
        matchedPath.users[1]?.isMatching
      ) {
        isAccepted = true
      } else {
        console.log('수락대기중')

        await this.unmatchedPathService.sleep(1000)
        const updatedMatchedPath = await this.matchedPathRepository
          .createQueryBuilder('matchedPath')
          .leftJoinAndSelect('matchedPath.users', 'users')
          .where('matchedPath.id = :id', { id: targetUser.matchedPath.id })
          .orderBy('users.id', 'ASC')
          .getOne()
        matchedPath = updatedMatchedPath
        console.log(matchedPath.users)
        elapsedTime += 1
      }
    }

    if (isAccepted && elapsedTime < timeoutLimit) {
      //택시기사매칭 로직
      const drivers = await this.userRepository.find({
        where: { isDriver: true },
      })

      if (drivers.length === 0) {
        socket.emit('noDriver')
      }
      if (!this.isAlreadySentMap.get(matchedPath.id)) {
        await this.sendWantLocationEvent(matchedPath, socket)
        this.isAlreadySentMap.set(matchedPath.id, true)
      }
      console.log(this.isAlreadySentMap)
      return '기사매칭 대기중'
    } else {
      if (socket.id) {
        socket.emit('rejectMatching')
      }
      if (otherUser.socketId) {
        socket.to(otherUser.socketId).emit('rejectMatching')
      }
    }
  }

  @SubscribeMessage('reject')
  async handleReject(@ConnectedSocket() socket: Socket, @MessageBody() user) {
    const targetUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.matchedPath', 'matchedPath')
      .where('user.id = :userId', {
        userId: user.id,
      })
      .getOne()
    console.log('타겟유저:', targetUser.matchedPath)
    const matchedPath = await this.matchedPathRepository.findOne({
      where: { id: targetUser.matchedPath.id },
      relations: ['users'],
    })
    const otherUser = matchedPath.users.find(
      (oppUser) => oppUser.id !== user.id,
    )
    console.log(otherUser)
    if (otherUser.socketId) {
      socket.to(otherUser.socketId).emit('rejectMatching')
    }
    socket.emit('rejectMatching')
    return
  }

  @SubscribeMessage('deleteMyUnmatchedPath')
  async handleDeleteMyUnmatchedPath(
    @ConnectedSocket() socket: Socket,
    @MessageBody() user,
  ) {
    const currentUser = await this.userRepository.findOne(user.id)
    currentUser.unmatchedPath = null
    await this.userRepository.save(currentUser)
  }

  @SubscribeMessage('hereIsLocation')
  async requestToDriver(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data,
  ) {
    try {
      console.log('hereIsLocation 실행중')
      const kakaoResponse = await this.kakaoMobilityService.getInfo(
        data.matchedPath.origin.lat,
        data.matchedPath.origin.lng,
        data.lat,
        data.lng,
      )

      if (kakaoResponse.result_code === 104) {
        socket.emit('letsDrive', data.matchedPath)
      } else if (kakaoResponse.summary.duration <= 6000000000000) {
        console.log('택시기사에게 send:', data.matchedPath)
        socket.emit('letsDrive', data.matchedPath)
        return
      }
    } catch (e) {
      console.log(e, 'hereIsLocation error')
    }
  }

  //택시기사가 수락했을때
  @SubscribeMessage('imDriver')
  async handleDriver(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchedPath,
  ) {
    //먼저 잡은 기사가 있을때
    if (matchedPath.isReal) {
      socket.emit('alreadyMatched')
    } else {
      //카카오페이결제 링크 받아오기
      matchedPath.isReal = true
      await this.matchedPathRepository.save(matchedPath)
      const firstUserUrl = await this.kakaoMobilityService.getPayment(
        Math.floor(matchedPath.firstFare),
      )
      const secondUserUrl = await this.kakaoMobilityService.getPayment(
        Math.floor(matchedPath.secondFare),
      )

      if (matchedPath.users[0].socketId && matchedPath.users[1].socketId) {
        socket.to(matchedPath.users[0].socketId).emit('kakaoPay', firstUserUrl)
        socket.to(matchedPath.users[1].socketId).emit('kakaoPay', secondUserUrl)

        await this.unmatchedPathService.sleep(5000)

        const updatedMatchedPath = await this.matchedPathRepository
          .createQueryBuilder('matchedPath')
          .leftJoinAndSelect('matchedPath.users', 'users')
          .where('matchedPath.id = :id', { id: matchedPath.id })
          .orderBy('users.id', 'ASC')
          .getOne()
        matchedPath = updatedMatchedPath

        let isAccepted = false
        //수락대기 경과시간
        let elapsedTime = 0
        //수락대기 최대시간
        const timeoutLimit = 1000
        console.log('pgToken:', matchedPath)
        while (!isAccepted && elapsedTime < timeoutLimit) {
          if (
            matchedPath.users[0].pgToken !== null &&
            matchedPath.users[1].pgToken !== null
          ) {
            isAccepted = true
          } else {
            console.log('결제완료대기중')
            await this.unmatchedPathService.sleep(1000)
            const updatedMatchedPath = await this.matchedPathRepository
              .createQueryBuilder('matchedPath')
              .leftJoinAndSelect('matchedPath.users', 'users')
              .where('matchedPath.id = :id', { id: matchedPath.id })
              .orderBy('users.id', 'ASC')
              .getOne()
            matchedPath = updatedMatchedPath
            console.log(matchedPath.users)
            elapsedTime += 1
          }
        }

        if (isAccepted && elapsedTime < timeoutLimit) {
          console.log(
            'pg토큰확인',
            matchedPath.users[0].pgToken,
            matchedPath.users[1].pgToken,
          )
          console.log('tid확인', firstUserUrl.tid, secondUserUrl.tid)

          try {
            await this.kakaoMobilityService.getApprove(
              firstUserUrl.tid,
              matchedPath.users[0].pgToken,
            )
            await this.kakaoMobilityService.getApprove(
              secondUserUrl.tid,
              matchedPath.users[1].pgToken,
            )
          } catch (err) {
            console.log('결제승인 오류메세지', err)

            if (matchedPath.users[0].socketId) {
              socket.to(matchedPath.users[0].socketId).emit('failedPay')
            }

            if (matchedPath.users[1].socketId) {
              socket.to(matchedPath.users[1].socketId).emit('failedPay')
            }

            socket.emit('failedPay')
            return
          }

          const updatedMatchedPath = await this.matchedPathRepository
            .createQueryBuilder('matchedPath')
            .leftJoinAndSelect('matchedPath.users', 'users')
            .where('matchedPath.id = :id', { id: matchedPath.id })
            .orderBy('users.id', 'ASC')
            .getOne()
          const firstUser = await this.entityManager.findOne(UserEntity, {
            where: { id: matchedPath.users[0].id },
            relations: ['unmatchedPath'],
          })
          const secondUser = await this.entityManager.findOne(UserEntity, {
            where: { id: matchedPath.users[1].id },
            relations: ['unmatchedPath'],
          })
          console.log(
            'imdriver',
            firstUser.unmatchedPath,
            secondUser.unmatchedPath,
          )

          console.log('navigation 이벤트 실행전')
          socket.emit('navigation', updatedMatchedPath)
          console.log('navigation 이벤트 실행후')

          const setInt = setInterval(() => {
            socket.emit('updateLocation', updatedMatchedPath)
          }, 10000)

          socket.on('finishDrive', () => {
            console.log('finishDrive 실행중')
            clearInterval(setInt)
            socket.to(firstUser.socketId).emit('finishTracking')
            socket.to(secondUser.socketId).emit('finishTracking')
          })

          return '승객들 결제완료'
        } else {
          if (matchedPath.users[0].socketId) {
            socket.to(matchedPath.users[0].socketId).emit('failedPay')
          }
          if (matchedPath.users[1].socketId) {
            socket.to(matchedPath.users[1].socketId).emit('failedPay')
          }
          socket.emit('failedPay')
        }
      } else {
        socket.emit('failedPay')
      }
    }
  }

  @SubscribeMessage('deleteUnmatchedPathAndEtc')
  async handleDbUpdate(@ConnectedSocket() socket: Socket) {
    const user = await this.userRepository.findOne({
      where: { socketId: socket.id },
      relations: ['matchedPath', 'unmatchedPath'],
    })
    //isMatching 과 socketId handleDisconnect에서 처리
    user.unmatchedPath = null
    user.matchedPath = null

    await this.userRepository.save(user)
  }

  @SubscribeMessage('socketIdSave')
  async handleCompletedPay(
    @ConnectedSocket() socket: Socket,
    @MessageBody() user,
  ) {
    user.socketId = socket.id
    user.isMatching = true
    await this.userRepository.save(user)
  }

  @SubscribeMessage('markLocation')
  async handleLoation(@ConnectedSocket() socket: Socket, @MessageBody() user) {
    console.log('출발지마킹')
    const user1 = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['unmatchedPath'],
    })
    socket.emit('location', user1.unmatchedPath)
  }

  @SubscribeMessage('realTimeLocation')
  async handleRealTimeLocation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data,
  ) {
    const matchedPath = await this.entityManager.findOne(MatchedPathEntity, {
      where: { id: data.matchedPath.id },
      relations: ['users'],
    })
    console.log('realTimeLocation 실행중', matchedPath.users)

    socket
      .to(matchedPath.users[0].socketId)
      .emit('hereIsRealTimeLocation', data)

    socket
      .to(matchedPath.users[1].socketId)
      .emit('hereIsRealTimeLocation', data)
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.userRepository.findOne({
      where: { socketId: socket.id },
      relations: ['matchedPath', 'unmatchedPath'],
    })

    if (user) {
      user.isMatching = false
      user.socketId = null
      user.isDriver = false
      // user.pgToken = null
      user.isAdmin = false
      await this.userRepository.save(user)
    }
    this.logger.log(`disconnected : ${socket.id}`)
  }
}
