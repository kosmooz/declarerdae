import { IsOptional, IsArray, IsString } from "class-validator";

export class SendToGeodaeDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deviceIds?: string[];
}
