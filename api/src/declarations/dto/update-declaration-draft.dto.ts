import { IsString, IsOptional, IsEmail, IsNumber } from "class-validator";

export class UpdateDeclarationDraftDto {
  // ── Exploitant ──
  @IsOptional() @IsString() exptNom?: string;
  @IsOptional() @IsString() exptPrenom?: string;
  @IsOptional() @IsString() exptRais?: string;
  @IsOptional() @IsString() exptSiren?: string;
  @IsOptional() @IsString() exptSiret?: string;
  @IsOptional() @IsString() exptTel1?: string;
  @IsOptional() @IsString() exptTel1Prefix?: string;
  @IsOptional() @IsEmail() exptEmail?: string;
  @IsOptional() @IsString() exptNum?: string;
  @IsOptional() @IsString() exptVoie?: string;
  @IsOptional() @IsString() exptCp?: string;
  @IsOptional() @IsString() exptCom?: string;
  @IsOptional() @IsString() exptType?: string;
  @IsOptional() @IsString() exptInsee?: string;

  // ── Site / Établissement ──
  @IsOptional() @IsString() nomEtablissement?: string;
  @IsOptional() @IsString() typeERP?: string;
  @IsOptional() @IsString() categorieERP?: string;

  // ── Adresse du site ──
  @IsOptional() @IsString() adrNum?: string;
  @IsOptional() @IsString() adrVoie?: string;
  @IsOptional() @IsString() adrComplement?: string;
  @IsOptional() @IsString() codePostal?: string;
  @IsOptional() @IsString() codeInsee?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsNumber() latCoor1?: number;
  @IsOptional() @IsNumber() longCoor1?: number;
  @IsOptional() @IsNumber() xyPrecis?: number;

  // ── Contact site ──
  @IsOptional() @IsString() tel1?: string;
  @IsOptional() @IsString() tel1Prefix?: string;
  @IsOptional() @IsString() tel2?: string;
  @IsOptional() @IsString() tel2Prefix?: string;
  @IsOptional() @IsString() siteEmail?: string;
}
