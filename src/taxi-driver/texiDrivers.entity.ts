import { CommonEntity } from './../common/entities/common.entity' // ormconfig.json에서 파싱 가능하도록 상대 경로로 지정
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { MatchedPathEntity } from './../matched-paths/matchedPaths.entity'

@Entity({
  name: 'TaxiDriver',
})
export class TaxiDriverEntity extends CommonEntity {
  @Column({ type: 'point', nullable: false })
  rating: string

  //* Relation */

  @OneToOne(() => MatchedPathEntity)
  matchedPath: MatchedPathEntity
}
