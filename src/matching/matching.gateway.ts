import { CurrentUser } from './../common/decorators/current-user.decorator'
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
import { Repository, getRepository } from 'typeorm'
import { Socket } from 'socket.io'
import { MatchedPathEntity } from '../matched-paths/matchedPaths.entity'
import { MatchedPathsService } from '../matched-paths/matched-paths.service'
import { EntityManager } from 'typeorm'
import { KakaoMobilityService } from 'src/common/kakaoMobilityService/kakao.mobility.service'
import * as fs from 'fs'

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
  @SubscribeMessage('test')
  async handleSocket(@ConnectedSocket() socket: Socket, @MessageBody() user) {
    user.socketId = socket.id
    await this.userRepository.save(user)

    let response = null
    let matchFound = false
    while (!matchFound) {
      response = await this.unmatchedPathService.setMatching(user)
      if (response !== null) {
        matchFound = true
      } else {
        console.log('대기중')
        await this.unmatchedPathService.sleep(1000)
      }
    }
    const matchedUserUP = response.matchedUserUP
    const oppUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
      .where('unmatchedPath.id = :unmatchedPathId', {
        unmatchedPathId: matchedUserUP.id,
      })
      .getOne()

    if (user.socketId && oppUser.socketId) {
      await this.matchedPathService.createMatchedPath(
        response.matchedPath,
        response.currentFare,
        response.matchedFare,
        user,
        oppUser,
      )
    }

    if (socket.id && oppUser.socketId) {
      socket.emit('matching', response)
      socket.to(oppUser.socketId).emit('matching', response)
    }
    user.socketId = null
    oppUser.socketId = null
    this.userRepository.save(user)
    this.userRepository.save(oppUser)
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
    let matchedPath = await this.matchedPathRepository.findOne({
      where: { id: targetUser.matchedPath.id },
      relations: ['users'],
    })

    let isAccepted = false
    //수락대기 경과시간
    let elapsedTime = 0
    //수락대기 최대시간
    const timeoutLimit = 30
    while (!isAccepted && elapsedTime < timeoutLimit) {
      if (matchedPath.users[0].isMatching && matchedPath.users[1].isMatching) {
        isAccepted = true
      } else {
        console.log('수락대기중')
        await this.unmatchedPathService.sleep(1000)
        const updatedMatchedPath = await this.entityManager.findOne(
          MatchedPathEntity,
          {
            where: { id: targetUser.matchedPath.id },
            relations: ['users'],
          },
        )
        matchedPath = updatedMatchedPath
        console.log(matchedPath.users)
        elapsedTime += 1
      }
    }
    const otherUser = matchedPath.users.find(
      (oppUser) => oppUser.id !== user.id,
    )
    if (isAccepted && elapsedTime < timeoutLimit) {
      //택시기사매칭 로직

      const drivers = await this.userRepository.find({
        where: { isDriver: true },
      })
      for (const driver of drivers) {
        console.log('wantLocation 이벤트 실행중')
        console.log('driver:', driver)
        socket.to(driver.socketId).emit('wantLocation', matchedPath)
      }

      return '매칭성공'
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

  // @SubscribeMessage('hereIsLocation')
  // async handleLocation(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() payload,
  // ) {
  //   const driverPos = payload.data
  //   const matchedPath = payload.matchedPath
  //   console.log('인자전달: ', [driverPos, matchedPath])
  //   const kakaoResponse = await this.kakaoMobilityService.getInfo(
  //     matchedPath.origin.lat,
  //     matchedPath.origin.lng,
  //     driverPos.lat,
  //     driverPos.lng,
  //   )
  //   if (kakaoResponse.summary.duration <= 600) {
  //     socket.emit('letsDrive', matchedPath)
  //   }
  // }

  @SubscribeMessage('hereIsLocation')
  async requestToDriver(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data,
  ) {
    console.log('hereIsLocation 실행중')
    const kakaoResponse = await this.kakaoMobilityService.getInfo(
      data.matchedPath.origin.lat,
      data.matchedPath.origin.lng,
      data.lat,
      data.lng,
    )
    console.log(kakaoResponse.summary.duration)
    if (kakaoResponse.summary.duration <= 1000000) {
      console.log('택시기사에게 send:', data.matchedPath)
      socket.emit('letsDrive', data.matchedPath)
      return
    }
  }

  @SubscribeMessage('imdriver')
  async handleDriver(
    @ConnectedSocket() socket: Socket,
    @MessageBody() matchedPath,
  ) {
    if (matchedPath.isReal) {
      socket.emit('alreadyMatched')
    } else {
      matchedPath.isReal = true
      // 택시기사에게는 길찾기 띄워주기
      // 승객들에게는 택시기사 위치? 띄어주면서 최종매칭완료 신호
    }
  }

  @SubscribeMessage('driverMode')
  async handleDriverMode(
    @ConnectedSocket() socket: Socket,
    @MessageBody() user,
  ) {
    const currentUser = await this.userRepository.findOne(user.id)
    currentUser.socketId = socket.id
    currentUser.isDriver = true
    await this.userRepository.save(currentUser)
    try {
      const htmlContent = fs.readFileSync(
        '/Users/baecheolhyein/Desktop/Nestjs/carpooling/views/matchingWaitingForDriver.hbs',
        'utf8',
      )
      socket.emit('renderDriverMode', { html: htmlContent })
    } catch (error) {
      console.error('rendering error:', error)
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.userRepository.findOne({ socketId: socket.id })
    console.log('diconnect user:', user)
    if (user) {
      user.isMatching = false
      user.socketId = null
      user.isDriver = false
      await this.userRepository.save(user)
    }
    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`)
  }
}
