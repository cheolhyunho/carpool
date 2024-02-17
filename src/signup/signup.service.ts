import { Body, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/users.entity'
import { Repository } from 'typeorm'
import { RequestDto } from './signup.request.dto'

@Injectable()
export class SignupService {
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
}
