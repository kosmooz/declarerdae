import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { Role } from "@prisma/client";
import * as argon2 from "argon2";
import { randomBytes, randomInt, createHash } from "crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private generateRandomToken(): string {
    return randomBytes(40).toString("hex");
  }

  private generate6DigitCode(): string {
    return randomInt(100000, 999999).toString();
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: Role,
  ): string {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  private async logAuth(
    userId: string | null,
    email: string,
    action: string,
    ip?: string,
    userAgent?: string,
  ) {
    try {
      await this.prisma.authLog.create({
        data: { userId, email, action, ip, userAgent },
      });
    } catch (err) {
      this.logger.warn(`Failed to write auth log: ${err}`);
    }
  }

  // ─── Register ────────────────────────────────────────────────────────

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const emailVerifyToken = this.generateRandomToken();

    const user = await this.prisma.user.create({
      data: { email, passwordHash, emailVerifyToken },
    });

    try {
      await this.mailService.sendVerificationEmail(email, emailVerifyToken);
    } catch {
      this.logger.warn(`Could not send verification email to ${email}`);
    }

    await this.logAuth(user.id, email, "REGISTER");

    // Auto-login: issue tokens so the user is immediately authenticated
    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRandomToken();
    const refreshTokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, message: "Registration successful. Please verify your email." };
  }

  // ─── Login ───────────────────────────────────────────────────────────

  async login(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      await this.logAuth(null, email, "LOGIN_FAILURE", ip, userAgent);
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.deleted) {
      await this.logAuth(user.id, email, "LOGIN_FAILURE_DELETED", ip, userAgent);
      throw new UnauthorizedException("This account has been deactivated");
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      await this.logAuth(user.id, email, "LOGIN_FAILURE", ip, userAgent);
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.emailVerified) {
      await this.logAuth(
        user.id,
        email,
        "LOGIN_FAILURE_UNVERIFIED",
        ip,
        userAgent,
      );
      throw new UnauthorizedException(
        "Veuillez vérifier votre adresse email avant de vous connecter",
      );
    }

    // In development: skip 2FA, issue tokens directly
    if (process.env.NODE_ENV !== "production") {
      const accessToken = this.generateAccessToken(user.id, user.email, user.role);
      const refreshToken = this.generateRandomToken();
      const refreshTokenHash = this.hashToken(refreshToken);

      await this.prisma.refreshToken.create({
        data: {
          tokenHash: refreshTokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await this.logAuth(user.id, email, "LOGIN_SUCCESS", ip, userAgent);

      return { accessToken, refreshToken };
    }

    // Generate 6-digit code and send by email
    const code = this.generate6DigitCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginCode: this.hashToken(code),
        loginCodeExpires: codeExpires,
      },
    });

    try {
      await this.mailService.sendLoginCode(email, code);
    } catch {
      this.logger.warn(`Could not send login code to ${email}`);
    }

    await this.logAuth(user.id, email, "LOGIN_CODE_SENT", ip, userAgent);

    return {
      requireCode: true,
      message: "Un code de vérification a été envoyé à votre adresse email.",
    };
  }

  // ─── Verify login code ──────────────────────────────────────────────

  async verifyLoginCode(
    email: string,
    code: string,
    ip?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.loginCode || !user.loginCodeExpires) {
      throw new UnauthorizedException("Code invalide ou expiré");
    }

    const codeHash = this.hashToken(code);
    if (
      codeHash !== user.loginCode ||
      user.loginCodeExpires < new Date()
    ) {
      await this.logAuth(user.id, email, "LOGIN_CODE_FAILURE", ip, userAgent);
      throw new UnauthorizedException("Code invalide ou expiré");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginCode: null, loginCodeExpires: null },
    });

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRandomToken();
    const refreshTokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await this.logAuth(user.id, email, "LOGIN_SUCCESS", ip, userAgent);

    return { accessToken, refreshToken };
  }

  // ─── Refresh ─────────────────────────────────────────────────────────

  async refresh(currentRefreshToken: string) {
    const tokenHash = this.hashToken(currentRefreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt < new Date()
    ) {
      if (storedToken) {
        this.logger.warn(
          `Refresh-token reuse detected for user ${storedToken.userId}`,
        );
        await this.prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { revoked: true },
        });
      }
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (storedToken.user.deleted) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revoked: true },
      });
      throw new UnauthorizedException("This account has been deactivated");
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const newRefreshToken = this.generateRandomToken();
    const newTokenHash = this.hashToken(newRefreshToken);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  // ─── Logout ──────────────────────────────────────────────────────────

  async logout(refreshToken: string, userId?: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
    if (userId) {
      await this.logAuth(userId, "", "LOGOUT");
    }
  }

  // ─── Me (without warehouseId/warehouse) ──────────────────────────────

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        siret: true,
        tvaNumber: true,
        createdAt: true,
        addresses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!user || (await this.isDeleted(userId))) {
      throw new UnauthorizedException("User not found");
    }
    return user;
  }

  private async isDeleted(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { deleted: true },
    });
    return user?.deleted ?? false;
  }

  // ─── Forgot password ────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    const msg = "If that email exists, a reset link has been sent.";
    if (!user || user.deleted) return { message: msg };

    const resetToken = this.generateRandomToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: this.hashToken(resetToken),
        resetPasswordExpires: resetExpires,
      },
    });

    try {
      await this.mailService.sendPasswordResetEmail(email, resetToken);
    } catch {
      this.logger.warn(`Could not send password reset email to ${email}`);
    }

    return { message: msg };
  }

  // ─── Reset password ─────────────────────────────────────────────────

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const tokenHash = this.hashToken(token);
    if (
      tokenHash !== user.resetPasswordToken ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    await this.logAuth(user.id, email, "PASSWORD_RESET");

    return { message: "Password reset successful. Please log in." };
  }

  // ─── Verify email ───────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new BadRequestException("Invalid verification token");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    return { message: "Email verified successfully" };
  }

  // ─── Resend verification email ─────────────────────────────────────

  async resendVerificationEmail(email: string) {
    const msg =
      "If that email exists and is not yet verified, a new verification link has been sent.";
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified || user.deleted) {
      return { message: msg };
    }

    const emailVerifyToken = this.generateRandomToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken },
    });

    try {
      await this.mailService.sendVerificationEmail(email, emailVerifyToken);
    } catch {
      this.logger.warn(`Could not resend verification email to ${email}`);
    }

    return { message: msg };
  }

  // ─── Update profile ─────────────────────────────────────────────────

  async updateProfile(
    userId: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      company?: string;
      siret?: string;
      tvaNumber?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.deleted) {
      throw new UnauthorizedException("User not found");
    }

    const updateData: Record<string, unknown> = {};

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException("Email already in use");
      }

      const emailVerifyToken = this.generateRandomToken();
      updateData.email = data.email;
      updateData.emailVerified = false;
      updateData.emailVerifyToken = emailVerifyToken;

      try {
        await this.mailService.sendVerificationEmail(
          data.email,
          emailVerifyToken,
        );
      } catch {
        this.logger.warn(`Could not send verification email to ${data.email}`);
      }
    }

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.siret !== undefined) updateData.siret = data.siret;
    if (data.tvaNumber !== undefined) updateData.tvaNumber = data.tvaNumber;

    if (Object.keys(updateData).length === 0) {
      return { message: "Aucune modification" };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { message: "Profil mis a jour", emailChanged: !!updateData.email };
  }

  // ─── Addresses ──────────────────────────────────────────────────────

  async listAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async createAddress(
    userId: string,
    data: {
      type: "BILLING" | "SHIPPING";
      isDefault?: boolean;
      firstName: string;
      lastName: string;
      company?: string;
      street: string;
      street2?: string;
      city: string;
      postalCode: string;
      country?: string;
      phone?: string;
    },
  ) {
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

  async updateAddress(
    userId: string,
    addressId: string,
    data: {
      type?: "BILLING" | "SHIPPING";
      isDefault?: boolean;
      firstName?: string;
      lastName?: string;
      company?: string;
      street?: string;
      street2?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      phone?: string;
    },
  ) {
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

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      throw new NotFoundException("Adresse introuvable");
    }

    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: "Adresse supprimee" };
  }

  // ─── Change password ────────────────────────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.deleted) {
      throw new UnauthorizedException("User not found");
    }

    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new BadRequestException("Current password is incorrect");
    }

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.logAuth(user.id, user.email, "PASSWORD_CHANGE");

    return { message: "Password changed successfully" };
  }
}
