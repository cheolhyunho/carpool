import { UserEntity } from 'src/users/users.entity'
import { Module } from '@nestjs/common'
import { SignupController } from './signup.controller'
import { SignupService } from './signup.service'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}
