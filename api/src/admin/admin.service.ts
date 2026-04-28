import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { computeStep } from "../subscriptions/compute-step";
import { isDeviceComplete } from "../declarations/compute-declaration-step";
import {
  DECLARATION_FIELDS,
  DEVICE_FIELDS,
} from "../declarations/declarations.service";
import * as argon2 from "argon2";

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // ─── Users ─────────────────────────────────────────────────────────

  async listUsers(
    search?: string,
    page = 1,
    limit = 20,
    includeDeleted = false,
    includeAddresses = false,
  ) {
    limit = Math.min(limit, 100);
    const where: any = {};

    if (!includeDeleted) {
      where.deleted = false;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const select: any = {
      id: true,
      email: true,
      emailVerified: true,
      role: true,
      deleted: true,
      createdAt: true,
      updatedAt: true,
    };

    if (includeAddresses) {
      select.firstName = true;
      select.lastName = true;
      select.phone = true;
      select.company = true;
      select.siret = true;
      select.tvaNumber = true;
      select.addresses = {
        orderBy: { isDefault: "desc" as const },
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: { orderBy: { isDefault: "desc" } },
      },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    const { passwordHash, ...rest } = user;
    return rest;
  }

  async createUser(data: {
    email: string;
    password: string;
    role?: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    siret?: string;
    tvaNumber?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException("Email deja utilise");
    }

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: (data.role as any) || "USER",
        emailVerified: data.emailVerified ?? false,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        siret: data.siret,
        tvaNumber: data.tvaNumber,
      },
    });

    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async updateUser(
    id: string,
    data: {
      email?: string;
      role?: string;
      emailVerified?: boolean;
      firstName?: string;
      lastName?: string;
      phone?: string;
      company?: string;
      siret?: string;
      tvaNumber?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException("Email deja utilise");
      }
    }

    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.siret !== undefined) updateData.siret = data.siret;
    if (data.tvaNumber !== undefined) updateData.tvaNumber = data.tvaNumber;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash, ...rest } = updated;
    return rest;
  }

  async softDeleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    await this.prisma.user.update({
      where: { id },
      data: { deleted: true },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { revoked: true },
    });

    return { message: "Utilisateur desactive" };
  }

  async restoreUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    await this.prisma.user.update({
      where: { id },
      data: { deleted: false },
    });

    return { message: "Utilisateur reactive" };
  }

  // ─── User Addresses ───────────────────────────────────────────────

  async createUserAddress(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, type: data.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: { userId, ...data },
    });
  }

  async updateUserAddress(userId: string, addressId: string, data: any) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      throw new NotFoundException("Adresse introuvable");
    }

    if (data.isDefault) {
      const type = data.type ?? address.type;
      await this.prisma.address.updateMany({
        where: { userId, type, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteUserAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      throw new NotFoundException("Adresse introuvable");
    }

    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: "Adresse supprimee" };
  }

  // ─── Stats ─────────────────────────────────────────────────────────

  async getStats() {
    const [totalUsers, verifiedUsers, adminUsers, deletedUsers] =
      await Promise.all([
        this.prisma.user.count({ where: { deleted: false } }),
        this.prisma.user.count({ where: { deleted: false, emailVerified: true } }),
        this.prisma.user.count({ where: { deleted: false, role: "ADMIN" } }),
        this.prisma.user.count({ where: { deleted: true } }),
      ]);

    return {
      totalUsers,
      verifiedUsers,
      adminUsers,
      deletedUsers,
    };
  }

  // ─── Dashboard ────────────────────────────────────────────────────

  async getDashboard() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsersMonth, newUsersWeek, recentAuthLogs] =
      await Promise.all([
        this.prisma.user.count({ where: { deleted: false } }),
        this.prisma.user.count({
          where: { deleted: false, createdAt: { gte: thirtyDaysAgo } },
        }),
        this.prisma.user.count({
          where: { deleted: false, createdAt: { gte: sevenDaysAgo } },
        }),
        this.prisma.authLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            email: true,
            action: true,
            ip: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      totalUsers,
      newUsersMonth,
      newUsersWeek,
      recentAuthLogs,
    };
  }

  // ─── Shop Settings ────────────────────────────────────────────────

  async getShopSettings() {
    let settings = await this.prisma.shopSettings.findFirst({
      where: { deleted: false },
      include: { images: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "asc" },
    });

    if (!settings) {
      settings = await this.prisma.shopSettings.create({
        data: { name: "STAR aid" },
        include: { images: { orderBy: { position: "asc" } } },
      });
    }

    return settings;
  }

  async updateShopSettings(data: any) {
    let settings = await this.prisma.shopSettings.findFirst({
      where: { deleted: false },
      orderBy: { createdAt: "asc" },
    });

    if (!settings) {
      settings = await this.prisma.shopSettings.create({
        data: { name: "STAR aid" },
      });
    }

    const { images, ...settingsData } = data;

    const updated = await this.prisma.shopSettings.update({
      where: { id: settings.id },
      data: settingsData,
      include: { images: { orderBy: { position: "asc" } } },
    });

    if (images && Array.isArray(images)) {
      await this.prisma.shopImage.deleteMany({
        where: { shopSettingsId: settings.id },
      });

      if (images.length > 0) {
        await this.prisma.shopImage.createMany({
          data: images.map((url: string, index: number) => ({
            shopSettingsId: settings.id,
            url,
            position: index,
          })),
        });
      }
    }

    this.mailService.invalidateCache();

    return this.prisma.shopSettings.findUnique({
      where: { id: settings.id },
      include: { images: { orderBy: { position: "asc" } } },
    });
  }

  async testSmtp(adminEmail: string) {
    return this.mailService.sendTestEmail(adminEmail);
  }

  // ─── Subscriptions ──────────────────────────────────────────────

  async getSubscriptionStats() {
    const [total, draft, pendingSignature, signed, active, cancelled] =
      await Promise.all([
        this.prisma.subscription.count(),
        this.prisma.subscription.count({ where: { status: "DRAFT" } }),
        this.prisma.subscription.count({ where: { status: "PENDING_SIGNATURE" } }),
        this.prisma.subscription.count({ where: { status: "SIGNED" } }),
        this.prisma.subscription.count({ where: { status: "ACTIVE" } }),
        this.prisma.subscription.count({ where: { status: "CANCELLED" } }),
      ]);

    return { total, draft, pendingSignature, signed, active, cancelled };
  }

  async listSubscriptions(
    search?: string,
    status?: string,
    step?: number,
    dateFrom?: string,
    dateTo?: string,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
  ) {
    limit = Math.min(limit, 100);
    const where: any = {};

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }

    if (step) {
      where.step = step;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rawSubscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    // Recompute step from data for accuracy
    const subscriptions = rawSubscriptions.map((s) => ({
      ...s,
      step: computeStep(s),
    }));

    return {
      subscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSubscription(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException("Contrat introuvable");
    }

    return { ...subscription, step: computeStep(subscription) };
  }

  async updateSubscription(
    id: string,
    data: { status?: string; notes?: string },
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException("Contrat introuvable");
    }

    const updateData: any = {};
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.status && data.status !== subscription.status) {
      // Validate allowed transitions
      const allowed: Record<string, string[]> = {
        DRAFT: ["CANCELLED"],
        PENDING_SIGNATURE: ["CANCELLED"],
        SIGNED: ["ACTIVE", "CANCELLED"],
        ACTIVE: ["CANCELLED"],
      };

      const transitions = allowed[subscription.status] || [];
      if (!transitions.includes(data.status)) {
        throw new ConflictException(
          `Transition de ${subscription.status} vers ${data.status} non autorisée`,
        );
      }

      updateData.status = data.status;
    }

    return this.prisma.subscription.update({
      where: { id },
      data: updateData,
    });
  }

  // ─── Declarations ──────────────────────────────────────────────

  async getDeclarationStats() {
    const [total, draft, complete, validated, cancelled, totalDevices] =
      await Promise.all([
        this.prisma.declaration.count(),
        this.prisma.declaration.count({ where: { status: "DRAFT" } }),
        this.prisma.declaration.count({ where: { status: "COMPLETE" } }),
        this.prisma.declaration.count({ where: { status: "VALIDATED" } }),
        this.prisma.declaration.count({ where: { status: "CANCELLED" } }),
        this.prisma.daeDevice.count(),
      ]);

    return { total, draft, complete, validated, cancelled, totalDevices };
  }

  async listDeclarations(
    search?: string,
    status?: string,
    step?: number,
    dateFrom?: string,
    dateTo?: string,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
  ) {
    limit = Math.min(limit, 100);
    const where: any = {};

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }

    if (step) {
      where.step = step;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    if (search) {
      where.OR = [
        { exptNom: { contains: search, mode: "insensitive" } },
        { exptPrenom: { contains: search, mode: "insensitive" } },
        { exptEmail: { contains: search, mode: "insensitive" } },
        { exptRais: { contains: search, mode: "insensitive" } },
        { ville: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rawDeclarations, total] = await Promise.all([
      this.prisma.declaration.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { daeDevices: true } },
          user: { select: { id: true, email: true, emailVerified: true } },
          daeDevices: { select: { geodaeStatus: true }, orderBy: { position: "asc" } },
        },
      }),
      this.prisma.declaration.count({ where }),
    ]);

    const declarations = rawDeclarations.map((d) => {
      const geodaeSynced = d.daeDevices.filter((dev) => dev.geodaeStatus === "SYNCED").length;
      const geodaeTotal = d.daeDevices.length;
      return {
        ...d,
        deviceCount: d._count.daeDevices,
        daeDevices: undefined,
        _count: undefined,
        user: d.user,
        geodaeSynced,
        geodaeTotal,
      };
    });

    return {
      declarations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDeclaration(id: string) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id },
      include: {
        daeDevices: { orderBy: { position: "asc" } },
        user: { select: { id: true, email: true, emailVerified: true, firstName: true, lastName: true } },
      },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }

    return declaration;
  }

  private pickFields(
    dto: Record<string, any>,
    fields: readonly string[],
  ): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key of fields) {
      if (dto[key] !== undefined) {
        result[key] = dto[key];
      }
    }
    return result;
  }

  async updateDeclaration(
    id: string,
    data: Record<string, any>,
    adminUser?: { sub: string; email: string },
  ) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id },
      include: { daeDevices: { orderBy: { position: "asc" } } },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }

    const auditEntries: Array<{
      declarationId: string;
      adminId: string | null;
      action: string;
      fieldName?: string | null;
      oldValue?: string | null;
      newValue?: string | null;
      deviceId?: string | null;
      deviceName?: string | null;
      metadata?: string | null;
    }> = [];
    const adminId = adminUser?.sub || null;
    const baseEntry = { declarationId: id, adminId };

    // ── Pick declaration fields ──
    const declUpdate: Record<string, any> = this.pickFields(
      data,
      DECLARATION_FIELDS,
    );
    if (data.notes !== undefined) declUpdate.notes = data.notes;

    // Audit: compare declaration field changes
    const SKIP_AUDIT = new Set(["step"]);
    for (const [key, newVal] of Object.entries(declUpdate)) {
      if (SKIP_AUDIT.has(key)) continue;
      const oldVal = (declaration as any)[key];
      const oldStr = oldVal == null ? "" : String(oldVal);
      const newStr = newVal == null ? "" : String(newVal);
      if (oldStr !== newStr) {
        auditEntries.push({
          ...baseEntry,
          action: "FIELD_UPDATE",
          fieldName: key,
          oldValue: oldStr || null,
          newValue: newStr || null,
        });
      }
    }

    // ── Update devices if provided ──
    if (Array.isArray(data.daeDevices)) {
      for (const deviceDto of data.daeDevices) {
        const deviceId = deviceDto.id;
        if (!deviceId) continue;
        const oldDevice = declaration.daeDevices.find((d) => d.id === deviceId);
        const deviceUpdate = this.pickFields(deviceDto, DEVICE_FIELDS);
        if (Object.keys(deviceUpdate).length > 0) {
          // Audit: compare device field changes
          if (oldDevice) {
            for (const [key, newVal] of Object.entries(deviceUpdate)) {
              const oldVal = (oldDevice as any)[key];
              const oldStr = oldVal == null ? "" : String(oldVal);
              const newStr = newVal == null ? "" : String(newVal);
              if (oldStr !== newStr) {
                auditEntries.push({
                  ...baseEntry,
                  action: "DEVICE_UPDATE",
                  fieldName: key,
                  oldValue: oldStr || null,
                  newValue: newStr || null,
                  deviceId,
                  deviceName: oldDevice.nom || `DAE ${oldDevice.position + 1}`,
                });
              }
            }
          }
          await this.prisma.daeDevice.update({
            where: { id: deviceId },
            data: deviceUpdate,
          });
        }
      }
    }

    // ── Status transition ──
    if (data.status && data.status !== declaration.status) {
      const allowed: Record<string, string[]> = {
        DRAFT: ["COMPLETE", "CANCELLED"],
        COMPLETE: ["VALIDATED", "CANCELLED"],
        VALIDATED: ["CANCELLED"],
        CANCELLED: ["COMPLETE"],
      };

      const transitions = allowed[declaration.status] || [];
      if (!transitions.includes(data.status)) {
        throw new ConflictException(
          `Transition de ${declaration.status} vers ${data.status} non autorisée`,
        );
      }

      // Audit: status change
      auditEntries.push({
        ...baseEntry,
        action: "STATUS_CHANGE",
        fieldName: "status",
        oldValue: declaration.status,
        newValue: data.status,
        metadata: data.cancelReason
          ? JSON.stringify({ cancelReason: data.cancelReason })
          : undefined,
      });

      // ── DRAFT -> COMPLETE: validate + attach user ──
      if (
        declaration.status === "DRAFT" &&
        data.status === "COMPLETE"
      ) {
        const freshDevices = await this.prisma.daeDevice.findMany({
          where: { declarationId: id },
          orderBy: { position: "asc" },
        });

        if (
          freshDevices.length === 0 ||
          !freshDevices.some(isDeviceComplete)
        ) {
          throw new BadRequestException(
            "Au moins un défibrillateur doit avoir tous les champs obligatoires remplis",
          );
        }

        let attachUserId = declaration.userId;

        if (data.createUser) {
          const { email, password } = data.createUser;
          const existing = await this.prisma.user.findUnique({
            where: { email },
          });
          if (existing) {
            throw new ConflictException(
              `Un utilisateur avec l'email ${email} existe déjà`,
            );
          }
          const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
          });
          const newUser = await this.prisma.user.create({
            data: { email, passwordHash, emailVerified: true },
          });
          attachUserId = newUser.id;
        } else if (data.userId) {
          attachUserId = data.userId;
        }

        if (!attachUserId) {
          throw new BadRequestException(
            "Un utilisateur doit être rattaché pour passer en Complète",
          );
        }

        // Audit: user attachment
        if (attachUserId !== declaration.userId) {
          auditEntries.push({
            ...baseEntry,
            action: "USER_ATTACHED",
            oldValue: declaration.userId || null,
            newValue: attachUserId,
          });
        }

        declUpdate.userId = attachUserId;
        declUpdate.step = 4;
      }

      declUpdate.status = data.status;

      // ── -> CANCELLED: store reason in notes + send email ──
      if (data.status === "CANCELLED") {
        if (data.cancelReason) {
          const ts = new Date().toLocaleString("fr-FR");
          const note = `[Annulee le ${ts}] ${data.cancelReason}`;
          declUpdate.notes = declaration.notes
            ? `${declaration.notes}\n${note}`
            : note;
        }

        const recipientEmail =
          declaration.userId
            ? (
                await this.prisma.user.findUnique({
                  where: { id: declaration.userId },
                  select: { email: true },
                })
              )?.email
            : null;
        const to = recipientEmail || declaration.exptEmail;

        if (to && data.cancelEmailBody) {
          this.mailService
            .sendDeclarationCancellation({
              to,
              number: declaration.number,
              exptRais: declaration.exptRais || "",
              reason: data.cancelReason || "Annulee",
              emailBody: data.cancelEmailBody,
            })
            .catch(() => {});
        }
      }
    }

    // ── Write audit logs ──
    if (auditEntries.length > 0) {
      await this.prisma.declarationAuditLog.createMany({
        data: auditEntries as any,
      });
    }

    // Bumper dataUpdatedAt si une vraie modification de champ data a eu lieu
    // (les FIELD_UPDATE concernent les champs envoyés à GéoDAE — exclut status, notes, step).
    const hasDataFieldChange = auditEntries.some(
      (e) => e.action === "FIELD_UPDATE" && !e.deviceId,
    );
    if (hasDataFieldChange) declUpdate.dataUpdatedAt = new Date();

    return this.prisma.declaration.update({
      where: { id },
      data: declUpdate,
      include: {
        daeDevices: { orderBy: { position: "asc" } },
        user: { select: { id: true, email: true, emailVerified: true, firstName: true, lastName: true } },
      },
    });
  }

  /* --- Audit logs --- */

  async getDeclarationAuditLogs(id: string) {
    return this.prisma.declarationAuditLog.findMany({
      where: { declarationId: id },
      include: {
        admin: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
