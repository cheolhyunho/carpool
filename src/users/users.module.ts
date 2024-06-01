import { SignupModule } from './../signup/signup.module'
import { SignupService } from 'src/signup/signup.service'
import { JwtStrategy } from './jwt/jwt.strategy'
import { Module } from '@nestjs/common'
import { UserEntity } from './users.entity'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      secretOrPrivateKey: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UserEntity, UsersService],
  controllers: [UsersController],
  exports: [UserEntity],
})
export class UsersModule {}
