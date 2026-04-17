import {
  IsString,
  IsInt,
  IsOptional,
  IsIn,
  IsEmail,
  Min,
} from "class-validator";

export class CreateDraftDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  @IsIn(["organisation", "particulier"])
  entityType?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  siret?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyPostalCode?: string;

  @IsOptional()
  @IsString()
  companyCity?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  fonction?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  installAddress?: string;

  @IsOptional()
  @IsString()
  installAddressComplement?: string;

  @IsOptional()
  @IsString()
  installPostalCode?: string;

  @IsOptional()
  @IsString()
  installCity?: string;
}
