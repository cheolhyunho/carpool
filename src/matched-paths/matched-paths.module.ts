import { UnmatchedPathEntity } from './../unmatched-paths/unmatchedpaths.entity'
import { UserEntity } from 'src/users/users.entity'
import { Module } from '@nestjs/common'
import { MatchedPathsController } from './matched-paths.controller'
import { MatchedPathsService } from './matched-paths.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MatchedPathEntity } from './matchedPaths.entity'
import { KakaoMobilityService } from 'src/common/kakaoMobilityService/kakao.mobility.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MatchedPathEntity,
      UserEntity,
      UnmatchedPathEntity,
    ]),
  ],
  controllers: [MatchedPathsController],
  providers: [MatchedPathsService, KakaoMobilityService],
})
export class MatchedPathsModule {}
