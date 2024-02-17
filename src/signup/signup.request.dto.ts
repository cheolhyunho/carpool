import { Exclude } from 'class-transformer'
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator'

export class RequestDto {
  /*
  @IsString()
  @IsNotEmpty({ message: '이름을 작성해주세요.' })*/
  username: string

  /*
  @Exclude()
  @IsString()
  @IsNotEmpty({ message: '주민번호를 입력해주세요.' })
  @MinLength(13, { message: '주민번호 13자리를 정확히 입력해주세요.' })
  @MaxLength(13, { message: '주민번호 13자리를 정확히 입력해주세요.' })*/
  identityNumber: string

  /*
  @IsEmail({}, { message: '올바른 이메일을 작성해주세요.' })
  @IsNotEmpty({ message: '이메일을 작성해주세요.' })*/
  email: string

  /*
  @Exclude()
  @IsString({ message: '비밀번호를 입력해주세요 ' })
  @MinLength(12, { message: '비밀번호는 최소 12자를 충족해야 합니다.' })
  @MaxLength(200, { message: '비밀번호는 200자 이하로만 가능합니다.' })*/
  password: string

  /*
  @Exclude()
  @IsString({ message: '비밀번호를 입력해주세요 ' })
  @MinLength(12, { message: '비밀번호는 최소 12자를 충족해야 합니다.' })
  @MaxLength(200, { message: '비밀번호는 200자 이하로만 가능합니다.' })*/
  confirmPassword: string
}
