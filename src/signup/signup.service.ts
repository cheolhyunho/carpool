import { Body, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/users.entity'
import { Repository } from 'typeorm'
import { RequestDto } from './signup.request.dto'
import { UserLogInDTO } from 'src/users/dtos/user-login.dto'
import { Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name)
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(requestDto: RequestDto) {
    console.log(requestDto)
    if (requestDto.password !== requestDto.confirmPassword) {
      return '비밀번호가 일치하지 않습니다.'
    }
    const user = this.userRepository.create({
      username: requestDto.username,
      identityNumber: requestDto.identityNumber,
      email: requestDto.email,
      password: requestDto.password,
    })
    await this.userRepository.save(user)
    return user
  }

  async loginUser(userloginDto: UserLogInDTO) {
    const user = await this.userRepository.findOne({
      email: userloginDto.email,
    })

    if (!user) {
      this.logger.error('이메일을 찾을 수 없습니다.')
      return
    }

    const isPasswordValid = user.password == userloginDto.password

    if (!isPasswordValid) {
      this.logger.error('비밀번호 일치하지 않습니다.')
      return
    }

    // 로그인 성공
    return user
  }
}
