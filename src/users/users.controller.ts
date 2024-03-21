import { UsersService } from './users.service'
import { Controller, Post } from '@nestjs/common'

@Controller('users')
export class UsersController {
  constructor(private readonly signupService: UsersService) {}
}
