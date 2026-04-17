import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { GeodaeService } from "./geodae.service";
import { SendToGeodaeDto } from "./dto/send-to-geodae.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("admin/geodae")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class GeodaeController {
  constructor(private readonly geodaeService: GeodaeService) {}

  @Post("send/:declarationId")
  async sendToGeodae(
    @Param("declarationId") declarationId: string,
    @Body() dto: SendToGeodaeDto,
    @Req() req: any,
  ) {
    return this.geodaeService.sendDeclarationToGeodae(
      declarationId,
      req.user.sub,
      dto.deviceIds,
    );
  }

  @Post("retry/:deviceId")
  async retryDevice(
    @Param("deviceId") deviceId: string,
    @Req() req: any,
  ) {
    return this.geodaeService.retryDevice(deviceId, req.user.sub);
  }

  @Get("status/:declarationId")
  async getStatus(@Param("declarationId") declarationId: string) {
    return this.geodaeService.getStatus(declarationId);
  }

  @Post("delete/:declarationId")
  async deleteFromGeodae(
    @Param("declarationId") declarationId: string,
    @Req() req: any,
  ) {
    return this.geodaeService.deleteFromGeodae(declarationId, req.user.sub);
  }

  @Post("test-connection")
  async testConnection() {
    return this.geodaeService.testConnection();
  }
}
