import { IsOptional, IsString, IsIn } from "class-validator";

export class ListArticlesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(["DRAFT", "PUBLISHED"])
  status?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  @IsIn(["createdAt", "updatedAt", "publishedAt", "title"])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: string;
}
