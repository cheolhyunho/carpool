import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MatchingGateway } from './matching.gateway'
import { UserEntity } from 'src/users/users.entity'
import { UsersModule } from 'src/users/users.module'
import { UnmatchedPathsModule } from 'src/unmatched-paths/unmatched-paths.module'
import { UnmatchedPathsService } from 'src/unmatched-paths/unmatched-paths.service'
import { UnmatchedPathEntity } from 'src/unmatched-paths/unmatchedpaths.entity'
import { KakaoMobilityService } from 'src/common/kakaoMobilityService/kakao.mobility.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UnmatchedPathEntity]),
    UsersModule,
    UnmatchedPathsModule,
  ],
  providers: [MatchingGateway, UnmatchedPathsService, KakaoMobilityService],
})
export class MatchingModule {}
