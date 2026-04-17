import { IsOptional, IsString, IsNumberString, IsBooleanString } from "class-validator";

export class ListUsersQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;

  @IsBooleanString()
  @IsOptional()
  includeDeleted?: string;

  @IsBooleanString()
  @IsOptional()
  includeAddresses?: string;
}
