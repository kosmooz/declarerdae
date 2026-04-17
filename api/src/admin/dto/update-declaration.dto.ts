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
  @IsOptional() @IsString() nom?: string;

  // Acces
  @IsOptional() @IsString() acc?: string;
  @IsOptional() @IsString() accLib?: string;
  @IsOptional() @IsString() accEtg?: string;
  @IsOptional() @IsString() accComplt?: string;
  @IsOptional() @IsString() accPcsec?: string;
  @IsOptional() @IsString() accAcc?: string;
  @IsOptional() @IsString() daeMobile?: string;

  // Disponibilite
  @IsOptional() @IsString() dispJ?: string;
  @IsOptional() @IsString() dispH?: string;
  @IsOptional() @IsString() dispComplt?: string;

  // Etat
  @IsOptional() @IsString() etatFonct?: string;

  // Fabricant
  @IsOptional() @IsString() fabRais?: string;
  @IsOptional() @IsString() fabSiren?: string;
  @IsOptional() @IsString() modele?: string;
  @IsOptional() @IsString() numSerie?: string;
  @IsOptional() @IsString() typeDAE?: string;
  @IsOptional() @IsString() idEuro?: string;

  // Maintenance
  @IsOptional() @IsString() dateInstal?: string;
  @IsOptional() @IsString() dermnt?: string;
  @IsOptional() @IsString() mntRais?: string;
  @IsOptional() @IsString() mntSiren?: string;
  @IsOptional() @IsString() freqMnt?: string;
  @IsOptional() @IsString() dispSurv?: string;

  // Electrodes & batterie
  @IsOptional() @IsString() lcPed?: string;
  @IsOptional() @IsString() dtprLcped?: string;
  @IsOptional() @IsString() dtprLcad?: string;
  @IsOptional() @IsString() dtprBat?: string;

  // Localisation DAE
  @IsOptional() @IsNumber() daeLat?: number;
  @IsOptional() @IsNumber() daeLng?: number;

  // Photos
  @IsOptional() @IsString() photo1?: string;
  @IsOptional() @IsString() photo2?: string;
}

export class UpdateDeclarationDto {
  // ── Statut & notes ──
  @IsOptional()
  @IsString()
  @IsIn(["DRAFT", "COMPLETE", "VALIDATED", "CANCELLED"])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** Reason for cancellation (stored in notes) */
  @IsOptional()
  @IsString()
  cancelReason?: string;

  /** Custom email body sent to the declarant on cancellation */
  @IsOptional()
  @IsString()
  cancelEmailBody?: string;

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

  // ── Site / Etablissement ──
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
