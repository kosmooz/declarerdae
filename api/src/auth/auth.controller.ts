import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Res,
  Param,
  UseGuards,
  HttpCode,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { VerifyLoginCodeDto } from "./dto/verify-login-code.dto";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

const REFRESH_COOKIE = "refresh_token";
const isProduction = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth",
  });
}

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto.email, dto.password);
    if (result.refreshToken) {
      setRefreshCookie(res, result.refreshToken);
    }
    return { accessToken: result.accessToken };
  }

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      dto.email,
      dto.password,
      req.ip,
      req.headers["user-agent"],
    );

    if (result.refreshToken) {
      setRefreshCookie(res, result.refreshToken);
      return { accessToken: result.accessToken };
    }

    return result;
  }

  @Post("verify-login-code")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyLoginCode(
    @Body() dto: VerifyLoginCodeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.verifyLoginCode(
        dto.email,
        dto.code,
        req.ip,
        req.headers["user-agent"],
      );
    setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const currentToken = req.cookies?.[REFRESH_COOKIE];
    if (!currentToken) {
      throw new UnauthorizedException("No refresh token provided");
    }

    const { accessToken, refreshToken } =
      await this.authService.refresh(currentToken);
    setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post("logout")
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await this.authService.logout(token);
    }
    clearRefreshCookie(res);
    return { message: "Logged out" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    return this.authService.me((req.user as any).sub);
  }

  @Post("forgot-password")
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.token, dto.password);
  }

  @Get("verify-email")
  async verifyEmail(
    @Query("token") token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyEmail(token);
    if (result.refreshToken) {
      setRefreshCookie(res, result.refreshToken);
    }
    return { message: result.message, accessToken: result.accessToken };
  }

  @Post("resend-verification")
  @HttpCode(200)
  async resendVerification(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile((req.user as any).sub, dto);
  }

  @Patch("change-password")
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      (req.user as any).sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get("addresses")
  @UseGuards(JwtAuthGuard)
  async listAddresses(@Req() req: Request) {
    return this.authService.listAddresses((req.user as any).sub);
  }

  @Post("addresses")
  @UseGuards(JwtAuthGuard)
  async createAddress(
    @Req() req: Request,
    @Body() dto: CreateAddressDto,
  ) {
    return this.authService.createAddress((req.user as any).sub, dto);
  }

  @Patch("addresses/:id")
  @UseGuards(JwtAuthGuard)
  async updateAddress(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.authService.updateAddress((req.user as any).sub, id, dto);
  }

  @Delete("addresses/:id")
  @UseGuards(JwtAuthGuard)
  async deleteAddress(
    @Req() req: Request,
    @Param("id") id: string,
  ) {
    return this.authService.deleteAddress((req.user as any).sub, id);
  }
}
