import { IsEnum, IsOptional, IsString, IsBoolean } from "class-validator";
import { AddressType } from "@prisma/client";

export class CreateAddressDto {
  @IsEnum(AddressType)
  type: AddressType;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  street: string;

  @IsString()
  @IsOptional()
  street2?: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
