import { IsNotEmpty } from 'class-validator'

export class MatchedPathDto {
  @IsNotEmpty()
  origin: string

  @IsNotEmpty()
  waypoint1: string

  @IsNotEmpty()
  waypoint2: string

  @IsNotEmpty()
  destination: string

  @IsNotEmpty()
  lessFare: number

  @IsNotEmpty()
  moreFare: number

  @IsNotEmpty()
  lessDuration: number

  @IsNotEmpty()
  moreDuration: number

  @IsNotEmpty()
  isReal: boolean
}
