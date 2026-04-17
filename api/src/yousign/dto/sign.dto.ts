import { IsString } from "class-validator";

export class SendOtpDto {
  @IsString()
  signatureRequestId: string;

  @IsString()
  signerId: string;
}

export class SignDto {
  @IsString()
  signatureRequestId: string;

  @IsString()
  signerId: string;

  @IsString()
  otp: string;
}
