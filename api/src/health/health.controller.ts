import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    let dbStatus = "ok";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "error";
    }
    return {
      status: dbStatus === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: dbStatus,
    };
  }

  @Get("rgpd-info")
  async rgpdInfo() {
    const settings = await this.prisma.shopSettings.findFirst({
      select: {
        dpoName: true,
        dpoEmail: true,
        dpoAddress: true,
        dpoPhone: true,
        companyName: true,
        companyStreet: true,
        companyPostalCode: true,
        companyCity: true,
      },
    });
    return {
      dpo: {
        name: settings?.dpoName || null,
        email: settings?.dpoEmail || null,
        address: settings?.dpoAddress || null,
        phone: settings?.dpoPhone || null,
      },
      company: {
        name: settings?.companyName || null,
        address: [settings?.companyStreet, settings?.companyPostalCode, settings?.companyCity]
          .filter(Boolean)
          .join(", ") || null,
      },
    };
  }
}
