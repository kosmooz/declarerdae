import { Module } from "@nestjs/common";
import { GdprController } from "./gdpr.controller";
import { GdprService } from "./gdpr.service";
import { GdprRetentionService } from "./gdpr-retention.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [GdprController],
  providers: [GdprService, GdprRetentionService],
  exports: [GdprRetentionService],
})
export class GdprModule {}
