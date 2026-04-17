import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDraftDto } from "./dto/create-draft.dto";
import { UpdateDraftDto } from "./dto/update-draft.dto";
import { computeStep } from "./compute-step";

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createDraft(dto: CreateDraftDto, ip?: string | null) {
    const data: Record<string, any> = {
      quantity: dto.quantity,
      status: "DRAFT",
      ip: ip || null,
      entityType: dto.entityType,
      companyName: dto.companyName,
      siret: dto.siret,
      companyAddress: dto.companyAddress,
      companyPostalCode: dto.companyPostalCode,
      companyCity: dto.companyCity,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fonction: dto.fonction,
      mobile: dto.mobile,
      email: dto.email,
      installAddress: dto.installAddress,
      installAddressComplement: dto.installAddressComplement,
      installPostalCode: dto.installPostalCode,
      installCity: dto.installCity,
    };

    // Compute step from the data itself
    data.step = computeStep({ status: "DRAFT", ...dto });

    const subscription = await this.prisma.subscription.create({ data });

    return { id: subscription.id };
  }

  async updateDraft(id: string, dto: UpdateDraftDto, ip?: string | null) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException("Brouillon introuvable");
    }

    if (subscription.status !== "DRAFT") {
      throw new BadRequestException(
        "Seuls les brouillons peuvent être modifiés",
      );
    }

    const updateData: Record<string, any> = {};
    if (ip) updateData.ip = ip;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.entityType !== undefined) updateData.entityType = dto.entityType;
    if (dto.companyName !== undefined) updateData.companyName = dto.companyName;
    if (dto.siret !== undefined) updateData.siret = dto.siret;
    if (dto.companyAddress !== undefined)
      updateData.companyAddress = dto.companyAddress;
    if (dto.companyPostalCode !== undefined)
      updateData.companyPostalCode = dto.companyPostalCode;
    if (dto.companyCity !== undefined) updateData.companyCity = dto.companyCity;
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.fonction !== undefined) updateData.fonction = dto.fonction;
    if (dto.mobile !== undefined) updateData.mobile = dto.mobile;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.installAddress !== undefined)
      updateData.installAddress = dto.installAddress;
    if (dto.installAddressComplement !== undefined)
      updateData.installAddressComplement = dto.installAddressComplement;
    if (dto.installPostalCode !== undefined)
      updateData.installPostalCode = dto.installPostalCode;
    if (dto.installCity !== undefined) updateData.installCity = dto.installCity;

    // Merge current DB values with incoming update to compute the step
    const merged = { ...subscription, ...updateData };
    updateData.step = computeStep(merged);

    await this.prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    return { id };
  }
}
