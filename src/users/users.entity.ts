import {
  IsBoolean,
  IsEmail,
  isNotEmpty,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { CommonEntity } from './../common/entities/common.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { Exclude } from 'class-transformer'
import { UnmatchedPathEntity } from './../unmatched-paths/unmatchedpaths.entity'
import { MatchedPathEntity } from './../matched-paths/matchedPaths.entity'

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'USER',
}) // USER : 테이블 명
export class UserEntity extends CommonEntity {
  @IsString()
  @IsNotEmpty({ message: '이름을 작성해주세요.' })
  @Column({ type: 'varchar', nullable: false })
  username: string

  @Exclude()
  @IsString()
  @IsNotEmpty({ message: '주민번호를 입력해주세요.' })
  @Column({ type: 'varchar', unique: true, nullable: false })
  identityNumber: string

  @IsEmail({}, { message: '올바른 이메일을 작성해주세요.' })
  @IsNotEmpty({ message: '이메일을 작성해주세요.' })
  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string

  @Exclude()
  @IsString({ message: '비밀번호를 입력해주세요 ' })
  @MinLength(12, { message: '비밀번호는 최소 12자를 충족해야 합니다.' })
  @MaxLength(200, { message: '비밀번호는 200자 이하로만 가능합니다.' })
  @Column({ type: 'varchar', unique: false, nullable: false })
  password: string

  @Column({ type: 'varchar', nullable: true })
  socketId: string

  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  isAdmin: boolean

  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  isDriver: boolean

  //* Relation */

  @OneToOne(() => UnmatchedPathEntity) // 단방향 연결, 양방향도 가능
  @JoinColumn({ name: 'unmatched_id', referencedColumnName: 'id' })
  unmatchedPath: UnmatchedPathEntity

  @ManyToOne(() => MatchedPathEntity)
  @JoinColumn({ name: 'matched_id', referencedColumnName: 'id' })
  matchedPath: MatchedPathEntity
}
