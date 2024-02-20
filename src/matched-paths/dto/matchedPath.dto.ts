import { IsNumber, IsNotEmpty } from 'class-validator'

export class UnmatchedPathDto {
  @IsNotEmpty()
  readonly lat: any

  @IsNotEmpty()
  readonly lng: any
}
