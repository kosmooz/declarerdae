import { IsEmail, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  token: string;

  @IsString()
  @MinLength(12)
  password: string;
}
