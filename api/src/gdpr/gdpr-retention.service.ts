import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GdprRetentionService {
  private readonly logger = new Logger(GdprRetentionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs weekly on Sunday at 3 AM.
   * Can also be triggered manually via admin endpoint.
   */
  @Cron("0 3 * * 0")
  async runRetention() {
    this.logger.log("Starting GDPR data retention cleanup...");

    const results = {
      draftsDeleted: 0,
      authLogsDeleted: 0,
      tokensDeleted: 0,
      auditLogsAnonymized: 0,
    };

    // 1. Delete DRAFT declarations older than 6 months with no activity
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const staleDrafts = await this.prisma.declaration.findMany({
      where: {
        status: "DRAFT",
        updatedAt: { lt: sixMonthsAgo },
      },
      select: { id: true },
    });

    if (staleDrafts.length > 0) {
      // Cascade: DaeDevice and DeclarationAuditLog have onDelete: Cascade
      const deleted = await this.prisma.declaration.deleteMany({
        where: {
          id: { in: staleDrafts.map((d) => d.id) },
        },
      });
      results.draftsDeleted = deleted.count;
    }

    // 2. Delete AuthLogs older than 13 months
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    const deletedLogs = await this.prisma.authLog.deleteMany({
      where: {
        createdAt: { lt: thirteenMonthsAgo },
      },
    });
    results.authLogsDeleted = deletedLogs.count;

    // 3. Delete expired tokens (refresh, reset, verify)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedTokens = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: thirtyDaysAgo } },
          { revoked: true, createdAt: { lt: thirtyDaysAgo } },
        ],
      },
    });
    results.tokensDeleted = deletedTokens.count;

    // 4. Anonymize PII in DeclarationAuditLog entries older than 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const anonymized = await this.prisma.declarationAuditLog.updateMany({
      where: {
        createdAt: { lt: threeYearsAgo },
        oldValue: { not: null },
      },
      data: {
        oldValue: "[anonymise]",
        newValue: "[anonymise]",
      },
    });
    results.auditLogsAnonymized = anonymized.count;

    this.logger.log(`GDPR retention completed: ${JSON.stringify(results)}`);
    return results;
  }
}
