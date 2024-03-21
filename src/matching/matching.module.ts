import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MatchingGateway } from './matching.gateway'
import { UserEntity } from 'src/users/users.entity'
import { UsersModule } from 'src/users/users.module'
import { UnmatchedPathsModule } from 'src/unmatched-paths/unmatched-paths.module'
import { UnmatchedPathsService } from 'src/unmatched-paths/unmatched-paths.service'
import { UnmatchedPathEntity } from 'src/unmatched-paths/unmatchedpaths.entity'
import { KakaoMobilityService } from 'src/common/kakaoMobilityService/kakao.mobility.service'
import { MatchedPathEntity } from '../matched-paths/matchedPaths.entity'
import { MatchedPathsModule } from '../matched-paths/matched-paths.module'
import { MatchedPathsService } from '../matched-paths/matched-paths.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UnmatchedPathEntity,
      MatchedPathEntity,
    ]),
    UsersModule,
    UnmatchedPathsModule,
    MatchedPathsModule,
  ],
  providers: [
    MatchingGateway,
    UnmatchedPathsService,
    KakaoMobilityService,
    MatchedPathsService,
  ],
})
export class MatchingModule {}
