import { IsOptional, IsString, IsIn } from "class-validator";

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  @IsIn([
    "DRAFT",
    "PENDING_SIGNATURE",
    "SIGNED",
    "ACTIVE",
    "CANCELLED",
  ])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
