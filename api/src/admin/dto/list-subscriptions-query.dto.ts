import { IsOptional, IsString, IsIn } from "class-validator";

export class ListSubscriptionsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string; // Single status or comma-separated (e.g. "SIGNED,PENDING_SIGNATURE")

  @IsOptional()
  @IsString()
  step?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  @IsIn(["createdAt", "updatedAt", "status"])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: string;
}
