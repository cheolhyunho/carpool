import { UserEntity } from 'src/users/users.entity'
import { Module } from '@nestjs/common'
import { SignupController } from './signup.controller'
import { SignupService } from './signup.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from 'src/users/jwt/jwt.strategy'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      secretOrPrivateKey: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [JwtStrategy, SignupService],
  controllers: [SignupController],
  exports: [SignupService],
})
export class SignupModule {}
