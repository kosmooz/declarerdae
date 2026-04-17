import { Controller, Get, Delete, Post, UseGuards, Req } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { GdprService } from "./gdpr.service";
import { GdprRetentionService } from "./gdpr-retention.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("GDPR")
@Controller("gdpr")
export class GdprController {
  constructor(
    private gdprService: GdprService,
    private gdprRetentionService: GdprRetentionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("export")
  async exportData(@Req() req: any) {
    return this.gdprService.exportUserData(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("delete-account")
  async deleteAccount(@Req() req: any) {
    return this.gdprService.deleteAccount(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post("run-retention")
  async runRetention() {
    return this.gdprRetentionService.runRetention();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get("compliance-stats")
  async complianceStats() {
    return this.gdprService.getComplianceStats();
  }
}
