import { UserEntity } from 'src/users/users.entity'
import { SignupModule } from './../signup/signup.module'
import { UsersModule } from './../users/users.module'
import { SignupService } from 'src/signup/signup.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { UnmatchedPathsController } from './unmatched-paths.controller'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([UnmatchedPathEntity, UserEntity]),
    UsersModule,
  ],
  controllers: [UnmatchedPathsController],
  providers: [UnmatchedPathsService],
})
export class UnmatchedPathsModule {}
