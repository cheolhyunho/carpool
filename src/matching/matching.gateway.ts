import { CurrentUser } from './../common/decorators/current-user.decorator'
import { InjectRepository } from '@nestjs/typeorm'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { UserEntity } from 'src/users/users.entity'
import { Repository } from 'typeorm'

@WebSocketGateway()
export class MatchingGateway {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  @SubscribeMessage('matching')
  async handleMatching(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    const targetUser = await this.userRepository.findOne(data.currentUserId)
    targetUser.socketId = socket.id
    const currentUser = await this.userRepository.save(targetUser)
    let matchedUser

    if (data.shorterOneDataWhenMatched.userDbId === data.currentUserId) {
      matchedUser = await this.userRepository.findOne(
        data.longerOneDataWhenMatched.userDbId,
      )
      while (matchedUser.socketId) {
        matchedUser = await this.userRepository.findOne(
          data.longerOneDataWhenMatched.userDbId,
        )
      }
      socket
        .to(currentUser.socketId)
        .emit('matchingResponse', data.shorterOneDataWhenMatched)
      socket
        .to(matchedUser.socketId)
        .emit('matchingSuggest', data.longerOneDataWhenMatched)
    } else {
      matchedUser = await this.userRepository.findOne(
        data.shorterOneDataWhenMatched.userDbId,
      )
      while (matchedUser.socketId) {
        matchedUser = await this.userRepository.findOne(
          data.shorterOneDataWhenMatched.userDbId,
        )
      }
      socket
        .to(currentUser.socketId)
        .emit('matchingResponse', data.longerOneDataWhenMatched)
      socket
        .to(matchedUser.socketId)
        .emit('matchingSuggest', data.shorterOneDataWhenMatched)
    }
  }
}
