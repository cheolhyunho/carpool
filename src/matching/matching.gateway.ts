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

@WebSocketGateway()
export class MatchingGateway implements OnGatewayDisconnect {
  constructor(
    private readonly unmatchedPathService: UnmatchedPathsService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
    const matchedUserUP = response[1]
    const oppUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.unmatchedPath', 'unmatchedPath')
      .where('unmatchedPath.id = :unmatchedPathId', {
        unmatchedPathId: matchedUserUP.id,
      })
      .getOne()

    console.log('opUser:', oppUser)
    socket.emit('matching', response)
    // socket.to(oppUser.socketId).emit('matching', response)
  }
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.userRepository.findOne({ socketId: socket.id })
    console.log('diconnect user:', user)
    if (user) {
      user.socketId = null
      await this.userRepository.save(user)
    }
    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`)
  }
}
