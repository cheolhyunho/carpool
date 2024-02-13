import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { UnmatchedPathsController } from './unmatched-paths.controller'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'

@Module({
  imports: [TypeOrmModule.forFeature([UnmatchedPathEntity])],
  controllers: [UnmatchedPathsController],
  providers: [UnmatchedPathsService],
})
export class UnmatchedPathsModule {}
