import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DeclarationsService } from "./declarations.service";
import { CreateDeclarationDraftDto } from "./dto/create-declaration-draft.dto";
import { UpdateDeclarationDraftDto } from "./dto/update-declaration-draft.dto";
import { CreateDaeDeviceDto } from "./dto/create-dae-device.dto";
import { UpdateDaeDeviceDto } from "./dto/update-dae-device.dto";
import { SendToGeodaeDto } from "../geodae/dto/send-to-geodae.dto";
import { GeodaeService } from "../geodae/geodae.service";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";

@ApiTags("Declarations")
@Controller("declarations")
export class DeclarationsController {
  constructor(
    private declarationsService: DeclarationsService,
    private geodaeService: GeodaeService,
  ) {}

  private extractIp(req: any): string | null {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      null
    );
  }

  /* ─── Public map ─────────────────────────────────────────── */

  @Get("public-map")
  async getPublicMapData() {
    return this.declarationsService.getPublicMapData();
  }

  /* ─── Draft ──────────────────────────────────────────────── */

  @Post("draft")
  async createDraft(@Body() dto: CreateDeclarationDraftDto, @Req() req: any) {
    return this.declarationsService.createDraft(dto, this.extractIp(req));
  }

  @Get("draft/:id")
  async getDraft(@Param("id") id: string) {
    return this.declarationsService.getDraft(id);
  }

  @Patch("draft/:id")
  async updateDraft(
    @Param("id") id: string,
    @Body() dto: UpdateDeclarationDraftDto,
    @Req() req: any,
  ) {
    return this.declarationsService.updateDraft(id, dto, this.extractIp(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post("draft/:id/link")
  async linkDraft(@Param("id") id: string, @Req() req: any) {
    return this.declarationsService.linkDraftToUser(id, req.user.sub);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post("draft/:id/complete")
  async completeDraft(@Param("id") id: string, @Req() req: any) {
    return this.declarationsService.completeDraft(
      id,
      req.user?.sub || null,
      this.extractIp(req),
      req.headers["user-agent"] || null,
    );
  }

  /* ─── User declarations ─────────────────────────────────── */

  @UseGuards(JwtAuthGuard)
  @Get("my")
  async listMyDeclarations(
    @Req() req: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    return this.declarationsService.listUserDeclarations(
      req.user.sub,
      parseInt(page || "1", 10),
      parseInt(limit || "20", 10),
      status || undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("my/:id")
  async getMyDeclaration(@Req() req: any, @Param("id") id: string) {
    return this.declarationsService.getUserDeclaration(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("my/:id")
  async updateMyDeclaration(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateDeclarationDraftDto,
  ) {
    return this.declarationsService.updateMyDeclaration(
      req.user.sub,
      id,
      dto,
      this.extractIp(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("my/:id/devices")
  async addMyDevice(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: CreateDaeDeviceDto,
  ) {
    return this.declarationsService.addMyDevice(req.user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("my/:id/devices/:deviceId")
  async updateMyDevice(
    @Req() req: any,
    @Param("id") id: string,
    @Param("deviceId") deviceId: string,
    @Body() dto: UpdateDaeDeviceDto,
  ) {
    return this.declarationsService.updateMyDevice(
      req.user.sub,
      id,
      deviceId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete("my/:id/devices/:deviceId")
  async removeMyDevice(
    @Req() req: any,
    @Param("id") id: string,
    @Param("deviceId") deviceId: string,
  ) {
    return this.declarationsService.removeMyDevice(req.user.sub, id, deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("my/:id/cancel")
  async cancelMyDeclaration(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    return this.declarationsService.cancelMyDeclaration(req.user.sub, id);
  }

  /* ─── User GéoDAE sync ───────────────────────────────────── */

  private static readonly USER_GEODAE_STATUSES = ["COMPLETE", "VALIDATED"];

  @UseGuards(JwtAuthGuard)
  @Post("my/:id/geodae/send")
  async sendMyToGeodae(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: SendToGeodaeDto,
  ) {
    await this.declarationsService.getUserDeclaration(req.user.sub, id);
    return this.geodaeService.sendDeclarationToGeodae(
      id,
      req.user.sub,
      dto.deviceIds,
      DeclarationsController.USER_GEODAE_STATUSES,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("my/:id/geodae/retry/:deviceId")
  async retryMyDevice(
    @Req() req: any,
    @Param("id") id: string,
    @Param("deviceId") deviceId: string,
  ) {
    // Verify ownership AND that the device belongs to this declaration
    const decl = await this.declarationsService.getUserDeclaration(req.user.sub, id);
    if (!decl.daeDevices.some((d: any) => d.id === deviceId)) {
      throw new NotFoundException("Appareil introuvable dans cette déclaration");
    }
    return this.geodaeService.retryDevice(
      deviceId,
      req.user.sub,
      DeclarationsController.USER_GEODAE_STATUSES,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("my/:id/geodae/status")
  async getMyGeodaeStatus(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    await this.declarationsService.getUserDeclaration(req.user.sub, id);
    return this.geodaeService.getStatus(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("my/:id/geodae/fetch/:deviceId")
  async fetchMyDeviceGeodae(
    @Req() req: any,
    @Param("id") id: string,
    @Param("deviceId") deviceId: string,
  ) {
    const decl = await this.declarationsService.getUserDeclaration(req.user.sub, id);
    const device = decl.daeDevices.find((d: any) => d.id === deviceId);
    if (!device) {
      throw new NotFoundException("Appareil introuvable dans cette déclaration");
    }
    if (!device.geodaeGid) {
      throw new BadRequestException("Cet appareil n'a pas encore été envoyé vers GéoDAE.");
    }
    return this.geodaeService.fetchDaeFromGeodae(device.geodaeGid);
  }

  @UseGuards(JwtAuthGuard)
  @Post("my/:id/geodae/delete/:deviceId")
  async deleteMyDeviceFromGeodae(
    @Req() req: any,
    @Param("id") id: string,
    @Param("deviceId") deviceId: string,
  ) {
    const decl = await this.declarationsService.getUserDeclaration(req.user.sub, id);
    const device = decl.daeDevices.find((d: any) => d.id === deviceId);
    if (!device) {
      throw new NotFoundException("Appareil introuvable dans cette déclaration");
    }
    if (!device.geodaeGid) {
      throw new BadRequestException("Cet appareil n'a pas encore été envoyé vers GéoDAE.");
    }
    // deleteFromGeodae processes all devices with a GID in the declaration.
    // We use sendDeclarationToGeodae with a single device after overriding its etatFonct isn't clean.
    // Instead, call the dedicated single-device delete method.
    return this.geodaeService.deleteSingleDevice(deviceId, req.user.sub);
  }

  /* ─── Devices ────────────────────────────────────────────── */

  @Post("draft/:id/devices")
  async addDevice(
    @Param("id") id: string,
    @Body() dto: CreateDaeDeviceDto,
  ) {
    return this.declarationsService.addDevice(id, dto);
  }

  @Patch("draft/:id/devices/:deviceId")
  async updateDevice(
    @Param("id") id: string,
    @Param("deviceId") deviceId: string,
    @Body() dto: UpdateDaeDeviceDto,
  ) {
    return this.declarationsService.updateDevice(id, deviceId, dto);
  }

  @Delete("draft/:id/devices/:deviceId")
  async removeDevice(
    @Param("id") id: string,
    @Param("deviceId") deviceId: string,
  ) {
    return this.declarationsService.removeDevice(id, deviceId);
  }
}
