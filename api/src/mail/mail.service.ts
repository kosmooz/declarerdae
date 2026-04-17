import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import * as nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private cachedConfig: SmtpConfig | null = null;
  private cacheExpiry = 0;
  private fingerprint = "";

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private get frontendUrl(): string {
    return this.config.get<string>("FRONTEND_URL", "http://localhost:3020");
  }

  private async getSmtpConfig(): Promise<SmtpConfig> {
    const now = Date.now();
    if (this.cachedConfig && now < this.cacheExpiry) {
      return this.cachedConfig;
    }

    const shop = await this.prisma.shopSettings.findFirst({
      where: { deleted: false },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        smtpPass: true,
        smtpFrom: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!shop?.smtpHost || !shop?.smtpUser || !shop?.smtpPass || !shop?.smtpFrom) {
      throw new Error(
        "Configuration SMTP incomplete. Verifiez les reglages email dans l'administration.",
      );
    }

    this.cachedConfig = {
      host: shop.smtpHost,
      port: shop.smtpPort ?? 465,
      user: shop.smtpUser,
      pass: shop.smtpPass,
      from: shop.smtpFrom,
    };
    this.cacheExpiry = now + 60_000;
    return this.cachedConfig;
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    const cfg = await this.getSmtpConfig();
    const fp = `${cfg.host}:${cfg.port}:${cfg.user}:${cfg.pass}`;

    if (this.transporter && fp === this.fingerprint) {
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    this.fingerprint = fp;
    return this.transporter;
  }

  invalidateCache(): void {
    this.cachedConfig = null;
    this.cacheExpiry = 0;
  }

  private getEmailFooter(): string {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:2px solid #d92d20;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:#444;">
        <tr><td style="padding:10px 0 6px;">
          <span style="font-size:14px;color:#d92d20;font-weight:bold;">STAR aid</span>
        </td></tr>
        <tr><td style="padding:8px 0;border-top:1px solid #eee;text-align:center;font-size:10px;color:#888;">
          &copy; ${new Date().getFullYear()} STAR aid — Tous droits reserves.
        </td></tr>
      </table>
    `;
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.getTransporter();
      const cfg = await this.getSmtpConfig();
      await transporter.sendMail({
        from: `"STAR aid" <${cfg.from}>`,
        to,
        subject: "Test SMTP - STAR aid",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #d92d20; font-size: 24px; margin-bottom: 16px;">Test SMTP reussi</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Si vous recevez cet email, votre configuration SMTP fonctionne correctement.
            </p>
            ${this.getEmailFooter()}
          </div>
        `,
      });
      this.logger.log(`Test email sent to ${to}`);
      return { success: true };
    } catch (err: any) {
      this.logger.error(`Failed to send test email to ${to}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    try {
      await transporter.sendMail({
        from: `"STAR aid" <${cfg.from}>`,
        to,
        subject: "Verifiez votre adresse email - STAR aid",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #d92d20; font-size: 24px; margin-bottom: 16px;">Bienvenue sur STAR aid</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Merci pour votre inscription ! Cliquez sur le bouton ci-dessous pour verifier votre adresse email.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}"
                 style="display: inline-block; padding: 14px 32px; background-color: #d92d20; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Verifier mon email
              </a>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
              <a href="${verifyUrl}" style="color: #d92d20;">${verifyUrl}</a>
            </p>
            ${this.getEmailFooter()}
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${to}: ${err}`);
      throw err;
    }
  }

  async sendLoginCode(to: string, code: string): Promise<void> {
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    try {
      await transporter.sendMail({
        from: `"STAR aid" <${cfg.from}>`,
        to,
        subject: "Votre code de connexion - STAR aid",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #d92d20; font-size: 24px; margin-bottom: 16px;">Code de connexion</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Voici votre code de verification pour vous connecter :
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; padding: 20px 40px; background-color: #fef2f2; border: 2px solid #d92d20; border-radius: 12px; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #d92d20;">
                ${code}
              </div>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">
              Ce code expire dans 10 minutes. Si vous n'avez pas demande ce code, ignorez cet email.
            </p>
            ${this.getEmailFooter()}
          </div>
        `,
      });
      this.logger.log(`Login code sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send login code to ${to}: ${err}`);
      throw err;
    }
  }

  async sendSubscriptionConfirmation(data: {
    to: string;
    firstName: string;
    lastName: string;
    entityType: string;
    companyName?: string;
    siret?: string;
    companyAddress?: string;
    companyPostalCode?: string;
    companyCity?: string;
    fonction?: string;
    mobile: string;
    email: string;
    installAddress: string;
    installAddressComplement?: string;
    installPostalCode: string;
    installCity: string;
    quantity: number;
    monthlyPriceHT: string;
    monthlyPriceTTC: string;
    signatureRequestId: string;
  }): Promise<void> {
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    const isOrg = data.entityType === "organisation";
    const fullName = `${data.firstName} ${data.lastName}`;
    const installAddr = [
      data.installAddress,
      data.installAddressComplement,
      `${data.installPostalCode} ${data.installCity}`,
    ].filter(Boolean).join(", ");

    const companyBlock = isOrg
      ? `
        <tr><td style="padding:6px 0;color:#555;font-size:14px;border-bottom:1px solid #f0f0f0;">
          <strong>Raison sociale :</strong> ${data.companyName || "-"}
        </td></tr>
        <tr><td style="padding:6px 0;color:#555;font-size:14px;border-bottom:1px solid #f0f0f0;">
          <strong>SIRET :</strong> ${data.siret || "-"}
        </td></tr>
        ${data.companyAddress ? `<tr><td style="padding:6px 0;color:#555;font-size:14px;border-bottom:1px solid #f0f0f0;">
          <strong>Adresse siège :</strong> ${data.companyAddress}, ${data.companyPostalCode} ${data.companyCity}
        </td></tr>` : ""}
      `
      : "";

    const downloadUrl = `${this.frontendUrl}/api/yousign/download/${data.signatureRequestId}`;

    // ── Email to the client ──
    const clientHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:22px;color:#d92d20;font-weight:bold;">STAR aid</span>
        </div>

        <h1 style="color:#d92d20;font-size:22px;margin-bottom:8px;">Merci pour votre souscription !</h1>
        <p style="color:#333;font-size:15px;line-height:1.6;margin-bottom:24px;">
          Bonjour ${data.firstName},<br/><br/>
          Votre contrat de location de défibrillateur a bien été signé électroniquement.
          Notre équipe prend en charge votre demande dans les plus brefs délais.
          <strong>Un professionnel vous contactera prochainement</strong> pour organiser
          la livraison et l'installation de votre matériel.
        </p>

        <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:20px;margin-bottom:24px;">
          <h2 style="font-size:16px;color:#d92d20;margin:0 0 12px;">Récapitulatif de votre commande</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Nom :</strong> ${fullName}
            </td></tr>
            ${data.fonction ? `<tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Fonction :</strong> ${data.fonction}
            </td></tr>` : ""}
            ${companyBlock}
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Email :</strong> ${data.email}
            </td></tr>
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Téléphone :</strong> ${data.mobile}
            </td></tr>
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Lieu d'installation :</strong> ${installAddr}
            </td></tr>
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Nombre d'appareils :</strong> ${data.quantity}
            </td></tr>
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Loyer mensuel :</strong> ${data.monthlyPriceHT} € HT / ${data.monthlyPriceTTC} € TTC par appareil
            </td></tr>
          </table>
        </div>

        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
          <h3 style="font-size:14px;color:#d92d20;margin:0 0 8px;">Prochaines étapes</h3>
          <ol style="margin:0;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">
            <li>Un professionnel STAR aid vous rappellera pour planifier la livraison</li>
            <li>Installation du défibrillateur sur votre site</li>
            <li>Formation aux gestes de premiers secours incluse</li>
          </ol>
        </div>

        <div style="text-align:center;margin:24px 0;">
          <a href="${downloadUrl}"
             style="display:inline-block;padding:12px 28px;background-color:#d92d20;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">
            Télécharger mon contrat signé
          </a>
        </div>

        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;">
          <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
            <strong style="color:#333;">Besoin d'aide ?</strong><br/>
            Email : <a href="mailto:contact@star-aid.fr" style="color:#d92d20;">contact@star-aid.fr</a><br/>
            Assistance : <a href="mailto:assistance@star-aid.fr" style="color:#d92d20;">assistance@star-aid.fr</a><br/>
            Téléphone : 02 62 12 34 56
          </p>
        </div>

        ${this.getEmailFooter()}
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"STAR aid" <${cfg.from}>`,
        to: data.to,
        subject: "Votre contrat STAR aid a été signé - Confirmation de souscription",
        html: clientHtml,
      });
      this.logger.log(`Subscription confirmation email sent to ${data.to}`);
    } catch (err) {
      this.logger.error(`Failed to send subscription confirmation to ${data.to}: ${err}`);
    }

    // ── Email to admin (notification) ──
    const adminEmail = cfg.from; // Send notification to the SMTP from address
    const adminHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="color:#d92d20;font-size:20px;margin-bottom:16px;">Nouvelle souscription signée</h1>
        <p style="color:#333;font-size:15px;line-height:1.6;">
          Un nouveau contrat de location de défibrillateur vient d'être signé.
        </p>

        <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:20px;margin:16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Client :</strong> ${fullName}
            </td></tr>
            ${isOrg ? `<tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Société :</strong> ${data.companyName} (SIRET: ${data.siret || "-"})
            </td></tr>` : ""}
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Email :</strong> <a href="mailto:${data.email}" style="color:#d92d20;">${data.email}</a>
            </td></tr>
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Téléphone :</strong> <a href="tel:${data.mobile}" style="color:#d92d20;">${data.mobile}</a>
            </td></tr>
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Lieu d'installation :</strong> ${installAddr}
            </td></tr>
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Quantité :</strong> ${data.quantity} appareil(s)
            </td></tr>
            <tr><td style="padding:6px 0;color:#555;border-bottom:1px solid #f0f0f0;">
              <strong>Loyer :</strong> ${data.monthlyPriceHT} € HT / ${data.monthlyPriceTTC} € TTC par appareil/mois
            </td></tr>
          </table>
        </div>

        <p style="color:#666;font-size:13px;">
          <strong>Action requise :</strong> Veuillez contacter le client pour organiser la livraison et l'installation.
        </p>

        <div style="text-align:center;margin:20px 0;">
          <a href="${downloadUrl}"
             style="display:inline-block;padding:10px 24px;background-color:#d92d20;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:13px;">
            Télécharger le contrat signé
          </a>
        </div>

        ${this.getEmailFooter()}
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"STAR aid" <${cfg.from}>`,
        to: adminEmail,
        subject: `Nouvelle souscription - ${fullName}${isOrg ? ` (${data.companyName})` : ""} - ${data.quantity} appareil(s)`,
        html: adminHtml,
      });
      this.logger.log(`Admin notification email sent for subscription by ${fullName}`);
    } catch (err) {
      this.logger.error(`Failed to send admin notification: ${err}`);
    }
  }

  async sendDeclarationCancellation(data: {
    to: string;
    number: number;
    exptRais: string;
    reason: string;
    emailBody: string;
  }): Promise<void> {
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    // In dev, send to adminEmail from settings instead of real user
    const shop = await this.prisma.shopSettings.findFirst({
      where: { deleted: false },
      select: { adminEmail: true },
      orderBy: { createdAt: "asc" },
    });

    const isDev = process.env.NODE_ENV !== "production";
    const recipient = isDev && shop?.adminEmail ? shop.adminEmail : data.to;

    const bodyHtml = data.emailBody
      .split("\n")
      .map((line: string) => (line.trim() === "" ? "<br/>" : `<p style="margin:0 0 8px;color:#333;font-size:15px;line-height:1.6;">${line}</p>`))
      .join("\n");

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:22px;color:#000091;font-weight:bold;">DéclarerDéfibrillateur</span>
        </div>

        <div style="background:#fef2f2;border-left:4px solid #E1000F;border-radius:4px;padding:16px;margin-bottom:24px;">
          <h1 style="color:#E1000F;font-size:18px;margin:0 0 4px;">Déclaration annulée</h1>
          <p style="color:#666;font-size:13px;margin:0;">
            Demande #${data.number} — ${data.exptRais || ""}
          </p>
        </div>

        <div style="margin-bottom:24px;">
          ${bodyHtml}
        </div>

        <div style="background:#F6F6F6;border-radius:6px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
            <strong style="color:#333;">Motif :</strong> ${data.reason}
          </p>
        </div>

        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;">
          <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
            <strong style="color:#333;">Besoin d'aide ?</strong><br/>
            Contactez notre équipe pour toute question relative à votre déclaration.<br/>
            Email : <a href="mailto:contact@declarerdefibrillateur.fr" style="color:#000091;">contact@declarerdefibrillateur.fr</a>
          </p>
        </div>

        ${this.getEmailFooter()}
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"DéclarerDéfibrillateur" <${cfg.from}>`,
        to: recipient,
        subject: `Déclaration #${data.number} annulée — ${data.reason}`,
        html,
      });
      this.logger.log(
        `Declaration cancellation email sent to ${recipient}${isDev && recipient !== data.to ? ` (dev override, original: ${data.to})` : ""}`,
      );
    } catch (err) {
      this.logger.error(`Failed to send cancellation email: ${err}`);
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    try {
      await transporter.sendMail({
        from: `"STAR aid" <${cfg.from}>`,
        to,
        subject: "Reinitialisation de votre mot de passe - STAR aid",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #d92d20; font-size: 24px; margin-bottom: 16px;">Reinitialisation du mot de passe</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en creer un nouveau.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}"
                 style="display: inline-block; padding: 14px 32px; background-color: #d92d20; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Reinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">
              Ce lien expire dans 1 heure. Si vous n'avez pas demande cette reinitialisation, ignorez cet email.<br/>
              <a href="${resetUrl}" style="color: #d92d20;">${resetUrl}</a>
            </p>
            ${this.getEmailFooter()}
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}: ${err}`);
      throw err;
    }
  }
}
