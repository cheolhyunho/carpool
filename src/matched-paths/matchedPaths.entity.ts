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
  @Column({ type: 'jsonb', nullable: false })
  origin: { lat: number; lng: number }

  @Column({ type: 'jsonb', nullable: true })
  destinationPoint: { lat: number; lng: number }

  @Column({ type: 'jsonb', nullable: false })
  firstWayPoint: { lat: number; lng: number }

  @Column({ type: 'jsonb', nullable: true })
  secondWayPoint: { lat: number; lng: number }

  @Column({ type: 'float', nullable: false })
  firstFare: number

  @Column({ type: 'float', nullable: false })
  secondFare: number

  @Column({ type: 'float', nullable: true })
  lessDuration: number

  @Column({ type: 'float', nullable: true })
  moreDuration: number

  @Column({ type: 'int', nullable: false })
  totalDistance: number

  @Column({ type: 'int', nullable: false })
  totalDuration: number

  @Column({ type: 'bool', nullable: false, default: false })
  isReal: boolean

  //* Relation */

  @OneToMany(() => UserEntity, (user: UserEntity) => user.matchedPath, {})
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
