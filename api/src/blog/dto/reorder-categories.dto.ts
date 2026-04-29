import { IsArray, IsString } from "class-validator";

export class ReorderCategoriesDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
