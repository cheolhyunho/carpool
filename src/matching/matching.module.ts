import { UnmatchedPathsModule } from './../unmatched-paths/unmatched-paths.module'
import { UserEntity } from 'src/users/users.entity'
import { MatchingGateway } from './matching.gateway'
import { Module } from '@nestjs/common'
import { UsersModule } from 'src/users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UsersModule],
  providers: [MatchingGateway],
})
export class MatchingModule {}
