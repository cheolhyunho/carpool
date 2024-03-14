import { CommonEntity } from '../common/entities/common.entity' // ormconfig.json에서 파싱 가능하도록 상대 경로로 지정
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'
import { MatchedPathEntity } from '../matched-paths/matchedPaths.entity'
import { UserEntity } from '../users/users.entity'
import { text, uuid } from 'aws-sdk/clients/customerprofiles'

@Entity({
  name: 'UnmatchedPaths',
}) // USER : 테이블 명
export class UnmatchedPathEntity extends CommonEntity {
  @Column({ type: 'jsonb', nullable: false })
  startingPoint: { lat: number; lng: number }

  @Column({ type: 'jsonb', nullable: true })
  destinationPoint: { lat: number; lng: number }

  @Column({ type: 'int', nullable: true })
  fare: number

  @Column({ type: 'int', nullable: true })
  distance: number

  @Column({ type: 'int', nullable: true })
  time: number

  @Column({ type: 'varchar', nullable: true, array: true, default: [] })
  userIdArray: string[]

  //* Relation */

  @OneToOne(() => UserEntity)
  user: UserEntity
  @ManyToOne(
    () => MatchedPathEntity,
    //수정해야 하는지 검토할 부분
    (matched: MatchedPathEntity) => matched.unmatchedPaths,
    {
      onDelete: 'CASCADE',
    },
  ) // 단방향 연결, 양방향도 가능
  matchedPath: MatchedPathEntity
}
