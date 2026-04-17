import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GdprService {
  constructor(private prisma: PrismaService) {}

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        siret: true,
        tvaNumber: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    const [addresses, declarations, consents, authLogs] = await Promise.all([
      this.prisma.address.findMany({
        where: { userId },
        select: {
          type: true,
          isDefault: true,
          firstName: true,
          lastName: true,
          company: true,
          street: true,
          street2: true,
          city: true,
          postalCode: true,
          country: true,
          phone: true,
          createdAt: true,
        },
      }),
      this.prisma.declaration.findMany({
        where: { userId },
        include: {
          daeDevices: {
            select: {
              nom: true,
              fabRais: true,
              modele: true,
              numSerie: true,
              typeDAE: true,
              etatFonct: true,
              acc: true,
              accLib: true,
              daeMobile: true,
              dateInstal: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.consent.findMany({
        where: { userId },
        select: {
          scope: true,
          version: true,
          granted: true,
          createdAt: true,
        },
      }),
      this.prisma.authLog.findMany({
        where: { userId },
        select: {
          action: true,
          ip: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return {
      exportDate: new Date().toISOString(),
      user,
      addresses,
      declarations: declarations.map((d) => ({
        number: d.number,
        status: d.status,
        exptRais: d.exptRais,
        exptNom: d.exptNom,
        exptPrenom: d.exptPrenom,
        exptEmail: d.exptEmail,
        exptTel1: d.exptTel1,
        exptSiren: d.exptSiren,
        exptSiret: d.exptSiret,
        nomEtablissement: d.nomEtablissement,
        ville: d.ville,
        codePostal: d.codePostal,
        createdAt: d.createdAt,
        devices: d.daeDevices,
      })),
      consents,
      authLogs,
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    // Anonymize declarations (preserve for legal obligation but remove PII)
    await this.prisma.declaration.updateMany({
      where: { userId },
      data: {
        exptNom: "[supprime]",
        exptPrenom: "[supprime]",
        exptEmail: "[supprime]",
        exptTel1: "[supprime]",
        siteEmail: "[supprime]",
        tel1: "[supprime]",
        tel2: null,
        ip: null,
      },
    });

    // Delete refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Delete addresses
    await this.prisma.address.deleteMany({
      where: { userId },
    });

    // Anonymize auth logs
    await this.prisma.authLog.updateMany({
      where: { userId },
      data: {
        email: "[supprime]",
        ip: null,
        userAgent: null,
      },
    });

    // Anonymize consents (keep for proof but remove PII)
    await this.prisma.consent.updateMany({
      where: { userId },
      data: {
        email: "[supprime]",
        ip: null,
        userAgent: null,
      },
    });

    // Anonymize and soft-delete the user
    const anonymizedEmail = `deleted_${userId}@anonymized.local`;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        firstName: null,
        lastName: null,
        phone: null,
        company: null,
        siret: null,
        tvaNumber: null,
        passwordHash: "",
        emailVerifyToken: null,
        resetPasswordToken: null,
        loginCode: null,
        deleted: true,
      },
    });

    return { success: true };
  }

  async getComplianceStats() {
    const settings = await this.prisma.shopSettings.findFirst({
      select: {
        dpoName: true,
        dpoEmail: true,
        dpoAddress: true,
        smtpHost: true,
        companyName: true,
        companyStreet: true,
      },
    });

    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalConsents,
      declarationConsents,
      totalUsers,
      deletedUsers,
      staleDrafts,
      oldAuthLogs,
      totalDeclarations,
    ] = await Promise.all([
      this.prisma.consent.count(),
      this.prisma.consent.count({ where: { scope: "declaration" } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { deleted: true } }),
      this.prisma.declaration.count({
        where: { status: "DRAFT", updatedAt: { lt: sixMonthsAgo } },
      }),
      this.prisma.authLog.count({
        where: { createdAt: { lt: thirteenMonthsAgo } },
      }),
      this.prisma.declaration.count({
        where: { status: { not: "DRAFT" } },
      }),
    ]);

    return {
      dpo: {
        name: settings?.dpoName || null,
        email: settings?.dpoEmail || null,
        address: settings?.dpoAddress || null,
        configured: !!(settings?.dpoName && settings?.dpoEmail),
      },
      company: {
        configured: !!(settings?.companyName && settings?.companyStreet),
      },
      smtp: {
        configured: !!settings?.smtpHost,
      },
      consents: {
        total: totalConsents,
        declarations: declarationConsents,
      },
      users: {
        total: totalUsers,
        deleted: deletedUsers,
      },
      retention: {
        staleDrafts,
        oldAuthLogs,
      },
      declarations: {
        total: totalDeclarations,
      },
    };
  }
}
