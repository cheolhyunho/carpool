import {
  BadRequestException,
  Body,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from 'src/users/users.entity'
import { Repository } from 'typeorm'
import { RequestDto } from './signup.request.dto'
import { UserLogInDTO } from 'src/users/dtos/user-login.dto'
import { Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name)
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(requestDto: RequestDto) {
    console.log(requestDto)
    const existingUser = await this.userRepository.findOne({
      where: { email: requestDto.email },
    })

    if (existingUser) {
      return '이미 등록된 이메일 주소입니다.'
    }

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

  async findUserById(id: string) {
    try {
      const user = await this.userRepository.findOne({ id })
      if (!user) throw new Error()
      return user
    } catch (error) {
      throw new BadRequestException('해당하는 사용자를 찾을 수 없습니다.')
    }
  }

  async verifyUserAndSignJwt(
    email: UserLogInDTO['email'],
    password: UserLogInDTO['password'],
  ): Promise<{ jwt: string; user: UserLogInDTO }> {
    const user = await this.userRepository.findOne({ email })
    if (!user)
      throw new UnauthorizedException('해당하는 이메일은 존재하지 않습니다.')

    if (password != user.password)
      throw new UnauthorizedException('로그인에 실패하였습니다.')
    try {
      const jwt = await this.jwtService.signAsync(
        { sub: user.id },
        { secret: this.configService.get('SECRET_KEY') },
      )
      return { jwt, user }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
