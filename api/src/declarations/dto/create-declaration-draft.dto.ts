import { IsString, IsOptional, IsEmail, IsNumber, MaxLength } from "class-validator";

export class CreateDeclarationDraftDto {
  // ── Exploitant ──
  @IsOptional() @IsString() @MaxLength(255) exptNom?: string;
  @IsOptional() @IsString() @MaxLength(255) exptPrenom?: string;
  @IsOptional() @IsString() @MaxLength(255) exptRais?: string;
  @IsOptional() @IsString() @MaxLength(20) exptSiren?: string;
  @IsOptional() @IsString() @MaxLength(20) exptSiret?: string;
  @IsOptional() @IsString() @MaxLength(20) exptTel1?: string;
  @IsOptional() @IsString() @MaxLength(5) exptTel1Prefix?: string;
  @IsOptional() @IsEmail() exptEmail?: string;
  @IsOptional() @IsString() @MaxLength(20) exptNum?: string;
  @IsOptional() @IsString() @MaxLength(255) exptVoie?: string;
  @IsOptional() @IsString() @MaxLength(10) exptCp?: string;
  @IsOptional() @IsString() @MaxLength(255) exptCom?: string;
  @IsOptional() @IsString() @MaxLength(100) exptType?: string;
  @IsOptional() @IsString() @MaxLength(10) exptInsee?: string;

  // ── Site / Établissement ──
  @IsOptional() @IsString() @MaxLength(255) nomEtablissement?: string;
  @IsOptional() @IsString() @MaxLength(100) typeERP?: string;
  @IsOptional() @IsString() @MaxLength(50) categorieERP?: string;

  // ── Adresse du site ──
  @IsOptional() @IsString() @MaxLength(20) adrNum?: string;
  @IsOptional() @IsString() @MaxLength(255) adrVoie?: string;
  @IsOptional() @IsString() @MaxLength(500) adrComplement?: string;
  @IsOptional() @IsString() @MaxLength(10) codePostal?: string;
  @IsOptional() @IsString() @MaxLength(10) codeInsee?: string;
  @IsOptional() @IsString() @MaxLength(255) ville?: string;
  @IsOptional() @IsNumber() latCoor1?: number;
  @IsOptional() @IsNumber() longCoor1?: number;
  @IsOptional() @IsNumber() xyPrecis?: number;

  // ── Contact site ──
  @IsOptional() @IsString() @MaxLength(20) tel1?: string;
  @IsOptional() @IsString() @MaxLength(5) tel1Prefix?: string;
  @IsOptional() @IsString() @MaxLength(20) tel2?: string;
  @IsOptional() @IsString() @MaxLength(5) tel2Prefix?: string;
  @IsOptional() @IsString() @MaxLength(255) siteEmail?: string;
}
