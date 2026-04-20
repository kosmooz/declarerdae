import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeclarationDraftDto } from "./dto/create-declaration-draft.dto";
import { UpdateDeclarationDraftDto } from "./dto/update-declaration-draft.dto";
import { CreateDaeDeviceDto } from "./dto/create-dae-device.dto";
import { UpdateDaeDeviceDto } from "./dto/update-dae-device.dto";
import { computeDeclarationStep, isDeviceComplete } from "./compute-declaration-step";

export const DECLARATION_FIELDS = [
  "exptNom", "exptPrenom", "exptRais", "exptSiren", "exptSiret",
  "exptTel1", "exptTel1Prefix", "exptEmail", "exptNum", "exptVoie", "exptCp", "exptCom", "exptType", "exptInsee",
  "nomEtablissement", "typeERP", "categorieERP",
  "adrNum", "adrVoie", "adrComplement", "codePostal", "codeInsee", "ville", "latCoor1", "longCoor1", "xyPrecis",
  "tel1", "tel1Prefix", "tel2", "tel2Prefix", "siteEmail",
] as const;

export const DEVICE_FIELDS = [
  "position", "nom",
  "acc", "accLib", "accEtg", "accComplt", "daeMobile",
  "dispJ", "dispH", "dispComplt",
  "etatFonct",
  "fabRais", "modele", "numSerie", "typeDAE",
  "dateInstal", "dermnt", "dispSurv",
  "lcPed", "dtprLcped", "dtprLcad",
  "daeLat", "daeLng",
  "photo1", "photo2",
] as const;

function pick<T extends Record<string, any>>(
  dto: T,
  fields: readonly string[],
): Record<string, any> {
  const data: Record<string, any> = {};
  for (const field of fields) {
    if (dto[field] !== undefined) {
      data[field] = dto[field];
    }
  }
  return data;
}

@Injectable()
export class DeclarationsService {
  constructor(private prisma: PrismaService) {}

  /* ─── Public map data (cached) ──────────────────────────── */

  private mapCache: { data: any; expiresAt: number } | null = null;
  private static MAP_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getPublicMapData() {
    if (this.mapCache && Date.now() < this.mapCache.expiresAt) {
      return this.mapCache.data;
    }

    const declarations = await this.prisma.declaration.findMany({
      where: {
        status: "VALIDATED",
        latCoor1: { not: null },
        longCoor1: { not: null },
      },
      select: {
        latCoor1: true,
        longCoor1: true,
        ville: true,
        codePostal: true,
        _count: { select: { daeDevices: true } },
      },
    });

    const points = declarations.map((d) => ({
      lat: d.latCoor1,
      lng: d.longCoor1,
      ville: d.ville || "",
      cp: d.codePostal || "",
      n: d._count.daeDevices,
    }));

    const totalDevices = points.reduce((sum, p) => sum + p.n, 0);
    const uniqueVilles = new Set(points.map((p) => p.ville).filter(Boolean));

    const result = {
      points,
      stats: {
        declarations: points.length,
        devices: totalDevices,
        villes: uniqueVilles.size,
      },
    };

    this.mapCache = {
      data: result,
      expiresAt: Date.now() + DeclarationsService.MAP_CACHE_TTL,
    };

    return result;
  }

  /* ─── Draft CRUD ─────────────────────────────────────────── */

  async createDraft(dto: CreateDeclarationDraftDto, ip?: string | null) {
    const data: Record<string, any> = {
      status: "DRAFT",
      ip: ip || null,
      ...pick(dto, DECLARATION_FIELDS),
    };

    // Create declaration with one empty device
    const declaration = await this.prisma.declaration.create({
      data: {
        ...data,
        daeDevices: { create: { position: 0 } },
      },
      include: { daeDevices: true },
    });

    data.step = computeDeclarationStep({
      status: "DRAFT",
      ...dto,
      daeDevices: declaration.daeDevices,
    });

    if (data.step !== 1) {
      await this.prisma.declaration.update({
        where: { id: declaration.id },
        data: { step: data.step },
      });
    }

    return {
      id: declaration.id,
      deviceId: declaration.daeDevices[0]?.id,
    };
  }

  async getDraft(id: string) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id },
      include: { daeDevices: { orderBy: { position: "asc" } } },
    });

    if (!declaration) {
      throw new NotFoundException("Brouillon introuvable");
    }

    return declaration;
  }

  async updateDraft(
    id: string,
    dto: UpdateDeclarationDraftDto,
    ip?: string | null,
  ) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id },
      include: { daeDevices: true },
    });

    if (!declaration) {
      throw new NotFoundException("Brouillon introuvable");
    }

    if (declaration.status !== "DRAFT") {
      throw new BadRequestException(
        "Seuls les brouillons peuvent être modifiés",
      );
    }

    const updateData: Record<string, any> = pick(dto, DECLARATION_FIELDS);
    if (ip) updateData.ip = ip;

    const merged = { ...declaration, ...updateData, daeDevices: declaration.daeDevices };
    updateData.step = computeDeclarationStep(merged);

    await this.prisma.declaration.update({
      where: { id },
      data: updateData,
    });

    return { id };
  }

  async linkDraftToUser(id: string, userId: string) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id },
    });

    if (!declaration) {
      throw new NotFoundException("Brouillon introuvable");
    }

    // Already linked to this user — nothing to do
    if (declaration.userId === userId) {
      return { id };
    }

    // Only link unowned drafts
    if (declaration.userId) {
      throw new BadRequestException(
        "Ce brouillon est déjà associé à un autre compte",
      );
    }

    await this.prisma.declaration.update({
      where: { id },
      data: { userId },
    });

    return { id };
  }

  async completeDraft(
    id: string,
    userId?: string | null,
    ip?: string | null,
    userAgent?: string | null,
  ) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id },
      include: { daeDevices: true },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }

    if (declaration.status !== "DRAFT") {
      throw new BadRequestException(
        "Seuls les brouillons peuvent être soumis",
      );
    }

    // Validate at least 1 device with required fields
    if (
      declaration.daeDevices.length === 0 ||
      !declaration.daeDevices.some(isDeviceComplete)
    ) {
      throw new BadRequestException(
        "Au moins un défibrillateur doit avoir tous les champs obligatoires remplis",
      );
    }

    const updateData: Record<string, any> = { status: "COMPLETE", step: 4 };
    // Link to user if provided and not already linked
    if (userId && !declaration.userId) {
      updateData.userId = userId;
    }

    await this.prisma.declaration.update({
      where: { id },
      data: updateData,
    });

    // Record RGPD consent
    if (declaration.exptEmail) {
      await this.prisma.consent.create({
        data: {
          email: declaration.exptEmail,
          userId: userId || undefined,
          scope: "declaration",
          version: "1.0",
          ip: ip || undefined,
          userAgent: userAgent || undefined,
        },
      });
    }

    return { id };
  }

  /* ─── User declarations ─────────────────────────────────── */

  async listUserDeclarations(
    userId: string,
    page: number,
    limit: number,
    status?: string,
  ) {
    const where: Record<string, any> = { userId };
    if (status) {
      where.status = status;
    }

    const [declarations, total] = await Promise.all([
      this.prisma.declaration.findMany({
        where,
        select: {
          id: true,
          exptRais: true,
          exptNom: true,
          exptPrenom: true,
          exptEmail: true,
          ville: true,
          step: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { daeDevices: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.declaration.count({ where }),
    ]);

    return {
      declarations: declarations.map((d) => ({
        ...d,
        deviceCount: d._count.daeDevices,
        _count: undefined,
      })),
      total,
    };
  }

  async getUserDeclaration(userId: string, declarationId: string) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: { orderBy: { position: "asc" } } },
    });

    if (!declaration || declaration.userId !== userId) {
      throw new NotFoundException("Déclaration introuvable");
    }

    return declaration;
  }

  /* ─── Device CRUD ────────────────────────────────────────── */

  async addDevice(declarationId: string, dto: CreateDaeDeviceDto) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: { select: { position: true } } },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }

    if (declaration.status !== "DRAFT") {
      throw new BadRequestException(
        "Seuls les brouillons peuvent être modifiés",
      );
    }

    // Auto-position: next after max
    const maxPos = declaration.daeDevices.reduce(
      (max, d) => Math.max(max, d.position),
      -1,
    );

    const deviceData: Record<string, any> = {
      declarationId,
      position: dto.position ?? maxPos + 1,
      ...pick(dto, DEVICE_FIELDS),
    };

    const device = await this.prisma.daeDevice.create({ data: deviceData as any });

    // Recompute step
    const updated = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: true },
    });
    if (updated) {
      await this.prisma.declaration.update({
        where: { id: declarationId },
        data: { step: computeDeclarationStep(updated) },
      });
    }

    return { id: device.id };
  }

  async updateDevice(
    declarationId: string,
    deviceId: string,
    dto: UpdateDaeDeviceDto,
  ) {
    const device = await this.prisma.daeDevice.findUnique({
      where: { id: deviceId },
      include: { declaration: true },
    });

    if (!device || device.declarationId !== declarationId) {
      throw new NotFoundException("Défibrillateur introuvable");
    }

    if (device.declaration.status !== "DRAFT") {
      throw new BadRequestException(
        "Seuls les brouillons peuvent être modifiés",
      );
    }

    const updateData = pick(dto, DEVICE_FIELDS);

    await this.prisma.daeDevice.update({
      where: { id: deviceId },
      data: updateData,
    });

    // Recompute step
    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: true },
    });
    if (declaration) {
      await this.prisma.declaration.update({
        where: { id: declarationId },
        data: { step: computeDeclarationStep(declaration) },
      });
    }

    return { id: deviceId };
  }

  async removeDevice(declarationId: string, deviceId: string) {
    const device = await this.prisma.daeDevice.findUnique({
      where: { id: deviceId },
      include: { declaration: { include: { daeDevices: true } } },
    });

    if (!device || device.declarationId !== declarationId) {
      throw new NotFoundException("Défibrillateur introuvable");
    }

    if (device.declaration.status !== "DRAFT") {
      throw new BadRequestException(
        "Seuls les brouillons peuvent être modifiés",
      );
    }

    if (device.declaration.daeDevices.length <= 1) {
      throw new BadRequestException(
        "Au moins un défibrillateur doit être présent",
      );
    }

    await this.prisma.daeDevice.delete({ where: { id: deviceId } });

    // Recompute step
    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: true },
    });
    if (declaration) {
      await this.prisma.declaration.update({
        where: { id: declarationId },
        data: { step: computeDeclarationStep(declaration) },
      });
    }

    return { success: true };
  }

  /* ─── User edit (authenticated, ownership-checked) ──────── */

  private assertEditable(declaration: { status: string; userId: string | null }, userId: string) {
    if (declaration.userId !== userId) {
      throw new NotFoundException("Déclaration introuvable");
    }
    if (declaration.status !== "DRAFT" && declaration.status !== "COMPLETE") {
      throw new BadRequestException(
        "Seules les déclarations en brouillon ou soumises peuvent être modifiées",
      );
    }
  }

  async updateMyDeclaration(
    userId: string,
    id: string,
    dto: UpdateDeclarationDraftDto,
    ip?: string | null,
  ) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id },
      include: { daeDevices: true },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }
    this.assertEditable(declaration, userId);

    const updateData: Record<string, any> = pick(dto, DECLARATION_FIELDS);
    if (ip) updateData.ip = ip;

    const merged = { ...declaration, ...updateData, daeDevices: declaration.daeDevices };
    updateData.step = computeDeclarationStep(merged);

    await this.prisma.declaration.update({
      where: { id },
      data: updateData,
    });

    return { id };
  }

  async addMyDevice(userId: string, declarationId: string, dto: CreateDaeDeviceDto) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: { select: { position: true } } },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }
    this.assertEditable(declaration, userId);

    const maxPos = declaration.daeDevices.reduce(
      (max, d) => Math.max(max, d.position),
      -1,
    );

    const deviceData: Record<string, any> = {
      declarationId,
      position: dto.position ?? maxPos + 1,
      ...pick(dto, DEVICE_FIELDS),
    };

    const device = await this.prisma.daeDevice.create({ data: deviceData as any });

    const updated = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: true },
    });
    if (updated) {
      await this.prisma.declaration.update({
        where: { id: declarationId },
        data: { step: computeDeclarationStep(updated) },
      });
    }

    return { id: device.id };
  }

  async updateMyDevice(
    userId: string,
    declarationId: string,
    deviceId: string,
    dto: UpdateDaeDeviceDto,
  ) {
    const device = await this.prisma.daeDevice.findUnique({
      where: { id: deviceId },
      include: { declaration: true },
    });

    if (!device || device.declarationId !== declarationId) {
      throw new NotFoundException("Défibrillateur introuvable");
    }
    this.assertEditable(device.declaration, userId);

    const updateData = pick(dto, DEVICE_FIELDS);

    await this.prisma.daeDevice.update({
      where: { id: deviceId },
      data: updateData,
    });

    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: true },
    });
    if (declaration) {
      await this.prisma.declaration.update({
        where: { id: declarationId },
        data: { step: computeDeclarationStep(declaration) },
      });
    }

    return { id: deviceId };
  }

  async removeMyDevice(userId: string, declarationId: string, deviceId: string) {
    const device = await this.prisma.daeDevice.findUnique({
      where: { id: deviceId },
      include: { declaration: { include: { daeDevices: true } } },
    });

    if (!device || device.declarationId !== declarationId) {
      throw new NotFoundException("Défibrillateur introuvable");
    }
    this.assertEditable(device.declaration, userId);

    if (device.declaration.daeDevices.length <= 1) {
      throw new BadRequestException(
        "Au moins un défibrillateur doit être présent",
      );
    }

    await this.prisma.daeDevice.delete({ where: { id: deviceId } });

    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: { daeDevices: true },
    });
    if (declaration) {
      await this.prisma.declaration.update({
        where: { id: declarationId },
        data: { step: computeDeclarationStep(declaration) },
      });
    }

    return { success: true };
  }
}
