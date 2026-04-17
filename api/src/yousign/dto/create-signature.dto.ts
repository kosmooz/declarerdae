import {
  IsString,
  IsInt,
  IsEmail,
  IsOptional,
  IsIn,
  Min,
} from "class-validator";

export class CreateSignatureDto {
  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsIn(["organisation", "particulier"])
  entityType: string;

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

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  fonction?: string;

  @IsString()
  mobile: string;

  @IsEmail()
  email: string;

  @IsString()
  installAddress: string;

  @IsOptional()
  @IsString()
  installAddressComplement?: string;

  @IsString()
  installPostalCode: string;

  @IsString()
  installCity: string;

  @IsString()
  monthlyPriceHT: string;

  @IsString()
  monthlyPriceTTC: string;
}
