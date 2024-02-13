import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { CommonEntity } from '../common/entities/common.entity' // ormconfig.json에서 파싱 가능하도록 상대 경로로 지정
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { MatchedPathEntity } from 'src/matched-paths/matchedPaths.entity'
import { UserEntity } from 'src/users/users.entity'

@Entity({
  name: 'UnmatchedPaths',
}) // USER : 테이블 명
export class UnmatchedPathEntity extends CommonEntity {
  @Column({ type: 'point', nullable: false })
  startingPoint: string

  @Column({ type: 'point', nullable: false })
  destinationPoint: string
  @Column({ type: 'int', nullable: false })
  fare: number

  @Column({ type: 'int', nullable: false })
  distance: number

  @Column({ type: 'int', nullable: false })
  time: number

  //* Relation */

  @OneToOne(() => UserEntity)
  user: UserEntity

  @ManyToOne(
    () => MatchedPathEntity,
    (matched: MatchedPathEntity) => matched.unmatchedPaths,
    {
      onDelete: 'CASCADE',
    },
  ) // 단방향 연결, 양방향도 가능
  matchedPath: MatchedPathEntity
}
