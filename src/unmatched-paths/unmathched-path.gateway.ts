import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'

@WebSocketGateway()
export class UnmathchedPathGateway {
  @SubscribeMessage('test')
  handleSocket(@ConnectedSocket() socket, @MessageBody() user) {
    console.log(socket.id)
    console.log(user)
    return
  }
}
