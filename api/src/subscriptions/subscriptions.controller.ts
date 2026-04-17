import { Controller, Post, Patch, Body, Param, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubscriptionsService } from "./subscriptions.service";
import { CreateDraftDto } from "./dto/create-draft.dto";
import { UpdateDraftDto } from "./dto/update-draft.dto";

@ApiTags("Subscriptions")
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post("draft")
  async createDraft(@Body() dto: CreateDraftDto, @Req() req: any) {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;
    return this.subscriptionsService.createDraft(dto, ip);
  }

  @Patch("draft/:id")
  async updateDraft(
    @Param("id") id: string,
    @Body() dto: UpdateDraftDto,
    @Req() req: any,
  ) {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;
    return this.subscriptionsService.updateDraft(id, dto, ip);
  }
}
