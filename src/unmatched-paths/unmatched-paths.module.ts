import { UserEntity } from 'src/users/users.entity'
import { SignupModule } from './../signup/signup.module'
import { UsersModule } from './../users/users.module'
import { SignupService } from 'src/signup/signup.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HttpModule, Module } from '@nestjs/common'
import { UnmatchedPathsController } from './unmatched-paths.controller'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'
import { JwtModule } from '@nestjs/jwt'
import { KakaoMobilityService } from 'src/common/kakaoMobilityService/kakao.mobility.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([UnmatchedPathEntity, UserEntity]),
    UsersModule,
  ],
  controllers: [UnmatchedPathsController],
  providers: [UnmatchedPathsService, KakaoMobilityService],
})
export class UnmatchedPathsModule {}
