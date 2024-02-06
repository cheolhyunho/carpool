import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { CommonEntity } from '../common/entities/common.entity' // ormconfig.json에서 파싱 가능하도록 상대 경로로 지정
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { UserEntity } from 'src/users/users.entity'
import { UnmatchedPathEntity } from 'src/unmatched-paths/unmatchedpaths.entity'
import { TaxiDriverEntity } from 'src/taxi-driver/texiDrivers.entity'

@Entity({
  name: 'MatchedPaths',
}) // USER : 테이블 명
export class MatchedPathEntity extends CommonEntity {
  @Column({ type: 'point', nullable: false })
  startingPoint: string

  @Column({ type: 'point', nullable: false })
  firstWayPoint: string

  @Column({ type: 'point', nullable: false })
  secondWayPoint: string

  @Column({ type: 'point', nullable: false })
  destinationPoint: string

  @Column({ type: 'int', nullable: false })
  lessFare: number

  @Column({ type: 'int', nullable: false })
  moreFare: number

  @Column({ type: 'int', nullable: false })
  lessTime: number

  @Column({ type: 'int', nullable: false })
  moreTime: number

  @Column({ type: 'bool', nullable: false })
  isReal: boolean

  //* Relation */

  @OneToMany(() => UserEntity, (user: UserEntity) => user.matchedPath, {
    cascade: true,
  })
  users: UserEntity[]

  @OneToMany(
    () => UnmatchedPathEntity,
    (unmatched: UnmatchedPathEntity) => unmatched.matchedPath,
    {
      cascade: true,
    },
  )
  unmatchedPaths: UnmatchedPathEntity[]

  @OneToOne(() => TaxiDriverEntity)
  driver: TaxiDriverEntity
}
