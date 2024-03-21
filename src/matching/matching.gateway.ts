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
        await this.unmatchedPathService.sleep(1000) // 예: 1초 대기
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

    const savedMatchedPath = await this.matchedPathService.createMatchedPath(
      response.matchedPath,
      response.currentFare,
      response.matchedFare,
      user,
      oppUser,
    )

    console.log('매창create:', savedMatchedPath)
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
    user.isAdmin = true
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
      if (matchedPath.users[0].isAdmin && matchedPath.users[1].isAdmin) {
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

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.userRepository.findOne({ socketId: socket.id })
    console.log('diconnect user:', user)
    if (user) {
      user.isAdmin = false
      user.socketId = null
      await this.userRepository.save(user)
    }
    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`)
  }
}
