import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { CommonEntity } from './../common/entities/common.entity' // ormconfig.json에서 파싱 가능하도록 상대 경로로 지정
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { UserEntity } from './../users/users.entity'
import { UnmatchedPathEntity } from './../unmatched-paths/unmatchedpaths.entity'
import { TaxiDriverEntity } from './../taxi-driver/texiDrivers.entity'

@Entity({
  name: 'MatchedPaths',
}) // USER : 테이블 명
export class MatchedPathEntity extends CommonEntity {
  @Column({ type: 'varchar', nullable: false })
  origin: string

  @Column({ type: 'varchar', nullable: false })
  waypoint1: string

  @Column({ type: 'varchar', nullable: false })
  waypoint2: string

  @Column({ type: 'varchar', nullable: false })
  destination: string

  @Column({ type: 'int', nullable: false })
  lessFare: number

  @Column({ type: 'int', nullable: false })
  moreFare: number

  @Column({ type: 'int', nullable: false })
  lessDuration: number

  @Column({ type: 'int', nullable: false })
  moreDuration: number

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
