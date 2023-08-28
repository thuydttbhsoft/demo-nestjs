import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Your password must be at least 6 characters' })
  password: string;
}
