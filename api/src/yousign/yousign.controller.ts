import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { YousignService } from "./yousign.service";
import { CreateSignatureDto } from "./dto/create-signature.dto";
import { SendOtpDto, SignDto } from "./dto/sign.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Yousign")
@Controller("yousign")
export class YousignController {
  constructor(private readonly yousignService: YousignService) {}

  @Post("signature-requests")
  async createSignatureRequest(
    @Body() dto: CreateSignatureDto,
    @Req() req: Request,
  ) {
    try {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        "unknown";
      return await this.yousignService.createSignatureRequest(dto, ip);
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.detail || error.message || "Yousign API error",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("send-otp")
  async sendOtp(@Body() dto: SendOtpDto) {
    try {
      return await this.yousignService.sendOtp(
        dto.signatureRequestId,
        dto.signerId,
      );
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.detail || error.message || "OTP send failed",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("sign")
  async sign(@Body() dto: SignDto, @Req() req: Request) {
    try {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        "unknown";
      return await this.yousignService.sign(
        dto.signatureRequestId,
        dto.signerId,
        dto.otp,
        ip,
      );
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.detail || error.message || "Signature failed",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("status/:signatureRequestId")
  async getSignatureStatus(
    @Param("signatureRequestId") signatureRequestId: string,
  ) {
    try {
      return await this.yousignService.getSignatureStatus(signatureRequestId);
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.detail || error.message || "Status check failed",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("download/:signatureRequestId")
  async downloadSignedPdf(
    @Param("signatureRequestId") signatureRequestId: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer =
        await this.yousignService.downloadSignedPdf(signatureRequestId);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=contrat-staraid-${signatureRequestId}.pdf`,
      });
      res.send(Buffer.from(pdfBuffer));
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.detail || error.message || "Download failed",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
