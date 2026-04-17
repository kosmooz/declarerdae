import { IsString, IsOptional, IsInt, IsNumber } from "class-validator";

export class CreateDaeDeviceDto {
  @IsOptional() @IsInt() position?: number;

  // ── Identification ──
  @IsOptional() @IsString() nom?: string;

  // ── Accès ──
  @IsOptional() @IsString() acc?: string;
  @IsOptional() @IsString() accLib?: string;
  @IsOptional() @IsString() accEtg?: string;
  @IsOptional() @IsString() accComplt?: string;
  @IsOptional() @IsString() accPcsec?: string;
  @IsOptional() @IsString() accAcc?: string;
  @IsOptional() @IsString() daeMobile?: string;

  // ── Disponibilité ──
  @IsOptional() @IsString() dispJ?: string;
  @IsOptional() @IsString() dispH?: string;
  @IsOptional() @IsString() dispComplt?: string;

  // ── État ──
  @IsOptional() @IsString() etatFonct?: string;

  // ── Fabricant ──
  @IsOptional() @IsString() fabRais?: string;
  @IsOptional() @IsString() fabSiren?: string;
  @IsOptional() @IsString() modele?: string;
  @IsOptional() @IsString() numSerie?: string;
  @IsOptional() @IsString() typeDAE?: string;
  @IsOptional() @IsString() idEuro?: string;

  // ── Maintenance ──
  @IsOptional() @IsString() dateInstal?: string;
  @IsOptional() @IsString() dermnt?: string;
  @IsOptional() @IsString() mntRais?: string;
  @IsOptional() @IsString() mntSiren?: string;
  @IsOptional() @IsString() freqMnt?: string;
  @IsOptional() @IsString() dispSurv?: string;

  // ── Électrodes & batterie ──
  @IsOptional() @IsString() lcPed?: string;
  @IsOptional() @IsString() dtprLcped?: string;
  @IsOptional() @IsString() dtprLcad?: string;
  @IsOptional() @IsString() dtprBat?: string;

  // ── Localisation DAE ──
  @IsOptional() @IsNumber() daeLat?: number;
  @IsOptional() @IsNumber() daeLng?: number;

  // ── Photos ──
  @IsOptional() @IsString() photo1?: string;
  @IsOptional() @IsString() photo2?: string;
}
