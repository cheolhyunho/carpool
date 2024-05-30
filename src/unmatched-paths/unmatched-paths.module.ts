import { UserEntity } from 'src/users/users.entity'
import { UsersModule } from './../users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { UnmatchedPathsController } from './unmatched-paths.controller'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'

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
