import {
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
  IsEmail,
  IsBoolean,
  ValidateNested,
  IsArray,
  MinLength,
  MaxLength,
  IsInt,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateUserInlineDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  password: string;
}

export class UpdateAdminDaeDeviceDto {
  @IsString()
  id: string;

  @IsOptional() @IsInt() position?: number;

  // Identification
  @IsOptional() @IsString() @MaxLength(255) nom?: string;

  // Acces
  @IsOptional() @IsString() @MaxLength(50) acc?: string;
  @IsOptional() @IsString() @MaxLength(10) accLib?: string;
  @IsOptional() @IsString() @MaxLength(50) accEtg?: string;
  @IsOptional() @IsString() @MaxLength(500) accComplt?: string;
  @IsOptional() @IsString() @MaxLength(10) daeMobile?: string;

  // Disponibilite
  @IsOptional() @IsString() @MaxLength(255) dispJ?: string;
  @IsOptional() @IsString() @MaxLength(255) dispH?: string;
  @IsOptional() @IsString() @MaxLength(500) dispComplt?: string;

  // Etat
  @IsOptional() @IsString() @MaxLength(100) etatFonct?: string;

  // Fabricant
  @IsOptional() @IsString() @MaxLength(255) fabRais?: string;
  @IsOptional() @IsString() @MaxLength(255) modele?: string;
  @IsOptional() @IsString() @MaxLength(100) numSerie?: string;
  @IsOptional() @IsString() @MaxLength(50) typeDAE?: string;

  // Maintenance
  @IsOptional() @IsString() @MaxLength(20) dateInstal?: string;
  @IsOptional() @IsString() @MaxLength(20) dermnt?: string;
  @IsOptional() @IsString() @MaxLength(10) dispSurv?: string;

  // Electrodes & batterie
  @IsOptional() @IsString() @MaxLength(10) lcPed?: string;
  @IsOptional() @IsString() @MaxLength(20) dtprLcped?: string;
  @IsOptional() @IsString() @MaxLength(20) dtprLcad?: string;

  // Localisation DAE
  @IsOptional() @IsNumber() daeLat?: number;
  @IsOptional() @IsNumber() daeLng?: number;

  // Photos
  @IsOptional() @IsString() @MaxLength(500) photo1?: string;
  @IsOptional() @IsString() @MaxLength(500) photo2?: string;
}

export class UpdateDeclarationDto {
  // ── Statut & notes ──
  @IsOptional()
  @IsString()
  @IsIn(["DRAFT", "COMPLETE", "VALIDATED", "CANCELLED"])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /** Reason for cancellation (stored in notes) */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelReason?: string;

  /** Custom email body sent to the declarant on cancellation */
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  cancelEmailBody?: string;

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

  // ── Site / Etablissement ──
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

  // ── Rattachement utilisateur ──
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserInlineDto)
  createUser?: CreateUserInlineDto;

  // ── Mise a jour devices ──
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAdminDaeDeviceDto)
  daeDevices?: UpdateAdminDaeDeviceDto[];
}
