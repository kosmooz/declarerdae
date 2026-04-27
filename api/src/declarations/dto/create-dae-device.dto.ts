import { IsString, IsOptional, IsInt, IsNumber, MaxLength } from "class-validator";

export class CreateDaeDeviceDto {
  @IsOptional() @IsInt() position?: number;

  // ── Identification ──
  @IsOptional() @IsString() @MaxLength(255) nom?: string;

  // ── Accès ──
  @IsOptional() @IsString() @MaxLength(50) acc?: string;
  @IsOptional() @IsString() @MaxLength(10) accLib?: string;
  @IsOptional() @IsString() @MaxLength(50) accEtg?: string;
  @IsOptional() @IsString() @MaxLength(500) accComplt?: string;
  @IsOptional() @IsString() @MaxLength(10) daeMobile?: string;

  // ── Disponibilité ──
  @IsOptional() @IsString() @MaxLength(255) dispJ?: string;
  @IsOptional() @IsString() @MaxLength(255) dispH?: string;
  @IsOptional() @IsString() @MaxLength(500) dispComplt?: string;

  // ── État ──
  @IsOptional() @IsString() @MaxLength(100) etatFonct?: string;

  // ── Fabricant ──
  @IsOptional() @IsString() @MaxLength(255) fabRais?: string;
  @IsOptional() @IsString() @MaxLength(255) modele?: string;
  @IsOptional() @IsString() @MaxLength(100) numSerie?: string;
  @IsOptional() @IsString() @MaxLength(50) typeDAE?: string;

  // ── Maintenance ──
  @IsOptional() @IsString() @MaxLength(20) dateInstal?: string;
  @IsOptional() @IsString() @MaxLength(20) dermnt?: string;
  @IsOptional() @IsString() @MaxLength(10) dispSurv?: string;

  // ── Électrodes & batterie ──
  @IsOptional() @IsString() @MaxLength(10) lcPed?: string;
  @IsOptional() @IsString() @MaxLength(20) dtprLcped?: string;
  @IsOptional() @IsString() @MaxLength(20) dtprLcad?: string;

  // ── Localisation DAE ──
  @IsOptional() @IsNumber() daeLat?: number;
  @IsOptional() @IsNumber() daeLng?: number;

  // ── Photos ──
  @IsOptional() @IsString() @MaxLength(500) photo1?: string;
  @IsOptional() @IsString() @MaxLength(500) photo2?: string;
}
