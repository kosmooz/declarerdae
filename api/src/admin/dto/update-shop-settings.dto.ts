import { IsString, IsNumber, IsOptional, IsArray, IsEmail, IsBoolean, IsIn } from "class-validator";

export class UpdateShopSettingsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  siret?: string;

  @IsString()
  @IsOptional()
  tvaNumber?: string;

  @IsString()
  @IsOptional()
  companyStreet?: string;

  @IsString()
  @IsOptional()
  companyStreet2?: string;

  @IsString()
  @IsOptional()
  companyPostalCode?: string;

  @IsString()
  @IsOptional()
  companyCity?: string;

  @IsString()
  @IsOptional()
  legalFirstName?: string;

  @IsString()
  @IsOptional()
  legalLastName?: string;

  @IsEmail()
  @IsOptional()
  legalEmail?: string;

  @IsString()
  @IsOptional()
  slogan?: string;

  @IsString()
  @IsOptional()
  siteIcon?: string;

  @IsEmail()
  @IsOptional()
  adminEmail?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  maintenanceEnabled?: boolean;

  @IsString()
  @IsIn(["ORDERS_BLOCKED", "FULL_BLOCK"])
  @IsOptional()
  maintenanceMode?: string;

  @IsString()
  @IsOptional()
  maintenanceTitle?: string;

  @IsString()
  @IsOptional()
  maintenanceDescription?: string;

  @IsString()
  @IsOptional()
  smtpHost?: string;

  @IsNumber()
  @IsOptional()
  smtpPort?: number;

  @IsString()
  @IsOptional()
  smtpUser?: string;

  @IsString()
  @IsOptional()
  smtpPass?: string;

  @IsString()
  @IsOptional()
  smtpFrom?: string;

  @IsString()
  @IsOptional()
  geodaeUsername?: string;

  @IsString()
  @IsOptional()
  geodaePassword?: string;

  @IsBoolean()
  @IsOptional()
  geodaeEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  geodaeTestMode?: boolean;

  @IsString()
  @IsOptional()
  geodaeMntSiren?: string;

  @IsString()
  @IsOptional()
  geodaeMntRais?: string;

  // RGPD / DPO
  @IsString()
  @IsOptional()
  dpoName?: string;

  @IsEmail()
  @IsOptional()
  dpoEmail?: string;

  @IsString()
  @IsOptional()
  dpoAddress?: string;

  @IsString()
  @IsOptional()
  dpoPhone?: string;

  // Authentification
  @IsBoolean()
  @IsOptional()
  skipEmailVerification?: boolean;

  @IsBoolean()
  @IsOptional()
  skip2FA?: boolean;
}
