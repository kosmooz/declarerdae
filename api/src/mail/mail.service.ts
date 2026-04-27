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

const BRAND = "DéclarerDéfibrillateur";
const CONTACT_EMAIL = "contact@declarerdefibrillateur.fr";

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

  /** In dev, redirect all emails to adminEmail from ShopSettings */
  private async devRecipient(originalTo: string): Promise<string> {
    if (process.env.NODE_ENV === "production") return originalTo;
    const shop = await this.prisma.shopSettings.findFirst({
      where: { deleted: false },
      select: { adminEmail: true },
      orderBy: { createdAt: "asc" },
    });
    const target = shop?.adminEmail || originalTo;
    if (target !== originalTo) {
      this.logger.log(`Dev override: email to ${originalTo} → ${target}`);
    }
    return target;
  }

  // ─── Email layout ──────────────────────────────────────────────

  private wrapEmail(content: string): string {
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F6F6F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F6F6;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Tricolor band -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#000091 33%,#FFF 33%,#FFF 66%,#E1000F 66%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <!-- Header -->
        <tr>
          <td style="background:#000091;padding:20px 32px;text-align:center;">
            <span style="font-size:20px;font-weight:700;color:#FFF;letter-spacing:0.5px;">${BRAND}</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#FFF;padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F6F6F6;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#929292;">
              <a href="${this.frontendUrl}" style="color:#000091;text-decoration:none;font-weight:600;">${BRAND}</a>
              &mdash; Service de declaration de defibrillateurs
            </p>
            <p style="margin:0;font-size:11px;color:#929292;">
              &copy; ${year} ${BRAND} &mdash; Tous droits reserves
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private makeButton(label: string, href: string, color = "#000091"): string {
    return `
      <div style="text-align:center;margin:28px 0;">
        <a href="${href}"
           style="display:inline-block;padding:14px 32px;background-color:${color};color:#FFF;text-decoration:none;border-radius:4px;font-weight:700;font-size:15px;">
          ${label}
        </a>
      </div>`;
  }

  // ─── Send helpers ──────────────────────────────────────────────

  async sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.getTransporter();
      const cfg = await this.getSmtpConfig();
      await transporter.sendMail({
        from: `"${BRAND}" <${cfg.from}>`,
        to,
        subject: `Test SMTP - ${BRAND}`,
        html: this.wrapEmail(`
          <h1 style="color:#18753C;font-size:22px;margin:0 0 16px;">Test SMTP reussi</h1>
          <p style="color:#3A3A3A;font-size:15px;line-height:1.6;">
            Si vous recevez cet email, votre configuration SMTP fonctionne correctement.
          </p>
        `),
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
    const recipient = await this.devRecipient(to);

    try {
      await transporter.sendMail({
        from: `"${BRAND}" <${cfg.from}>`,
        to: recipient,
        subject: `Verifiez votre adresse email - ${BRAND}`,
        html: this.wrapEmail(`
          <h1 style="color:#000091;font-size:22px;margin:0 0 16px;">Vérifiez votre adresse email</h1>
          <p style="color:#3A3A3A;font-size:15px;line-height:1.6;">
            Cliquez sur le bouton ci-dessous pour vérifier votre email et finaliser votre déclaration.
          </p>
          ${this.makeButton("Verifier mon email", verifyUrl)}
          <p style="color:#929292;font-size:12px;line-height:1.5;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
            <a href="${verifyUrl}" style="color:#000091;word-break:break-all;">${verifyUrl}</a>
          </p>
        `),
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
    const recipient = await this.devRecipient(to);

    try {
      await transporter.sendMail({
        from: `"${BRAND}" <${cfg.from}>`,
        to: recipient,
        subject: `Votre code de connexion - ${BRAND}`,
        html: this.wrapEmail(`
          <h1 style="color:#000091;font-size:22px;margin:0 0 16px;">Code de connexion</h1>
          <p style="color:#3A3A3A;font-size:15px;line-height:1.6;">
            Voici votre code de verification pour vous connecter :
          </p>
          <div style="text-align:center;margin:28px 0;">
            <div style="display:inline-block;padding:20px 40px;background-color:#F6F6F6;border:2px solid #000091;border-radius:8px;letter-spacing:8px;font-size:32px;font-weight:700;color:#000091;">
              ${code}
            </div>
          </div>
          <p style="color:#929292;font-size:12px;line-height:1.5;">
            Ce code expire dans 10 minutes. Si vous n'avez pas demande ce code, ignorez cet email.
          </p>
        `),
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

    const downloadUrl = `${this.frontendUrl}/api/yousign/download/${data.signatureRequestId}`;

    const row = (label: string, value: string) =>
      `<tr><td style="padding:8px 12px;color:#3A3A3A;font-size:14px;border-bottom:1px solid #E5E5E5;"><strong>${label}</strong></td><td style="padding:8px 12px;color:#3A3A3A;font-size:14px;border-bottom:1px solid #E5E5E5;">${value}</td></tr>`;

    const companyRows = isOrg
      ? [
          row("Raison sociale", data.companyName || "-"),
          row("SIRET", data.siret || "-"),
          ...(data.companyAddress ? [row("Adresse siege", `${data.companyAddress}, ${data.companyPostalCode} ${data.companyCity}`)] : []),
        ].join("")
      : "";

    // ── Email to the client ──
    const clientHtml = this.wrapEmail(`
      <h1 style="color:#000091;font-size:22px;margin:0 0 8px;">Merci pour votre souscription !</h1>
      <p style="color:#3A3A3A;font-size:15px;line-height:1.6;margin-bottom:24px;">
        Bonjour ${data.firstName},<br/><br/>
        Votre contrat de location de defibrillateur a bien ete signe electroniquement.
        Notre equipe prend en charge votre demande dans les plus brefs delais.
        <strong>Un professionnel vous contactera prochainement</strong> pour organiser
        la livraison et l'installation de votre materiel.
      </p>

      <div style="background:#F6F6F6;border-radius:4px;padding:20px;margin-bottom:24px;">
        <h2 style="font-size:16px;color:#000091;margin:0 0 12px;">Recapitulatif de votre commande</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
          ${row("Nom", fullName)}
          ${data.fonction ? row("Fonction", data.fonction) : ""}
          ${companyRows}
          ${row("Email", data.email)}
          ${row("Telephone", data.mobile)}
          ${row("Lieu d'installation", installAddr)}
          ${row("Nombre d'appareils", String(data.quantity))}
          ${row("Loyer mensuel", `${data.monthlyPriceHT} &euro; HT / ${data.monthlyPriceTTC} &euro; TTC par appareil`)}
        </table>
      </div>

      <div style="background:#e8f5e9;border-left:4px solid #18753C;border-radius:4px;padding:16px;margin-bottom:24px;">
        <h3 style="font-size:14px;color:#18753C;margin:0 0 8px;">Prochaines etapes</h3>
        <ol style="margin:0;padding-left:20px;color:#3A3A3A;font-size:13px;line-height:1.8;">
          <li>Notre equipe vous rappellera pour planifier la livraison</li>
          <li>Installation du defibrillateur sur votre site</li>
          <li>Formation aux gestes de premiers secours incluse</li>
        </ol>
      </div>

      ${this.makeButton("Telecharger mon contrat signe", downloadUrl)}

      <div style="background:#F6F6F6;border-radius:4px;padding:16px;">
        <p style="margin:0;font-size:13px;color:#929292;line-height:1.6;">
          <strong style="color:#3A3A3A;">Besoin d'aide ?</strong><br/>
          Email : <a href="mailto:${CONTACT_EMAIL}" style="color:#000091;">${CONTACT_EMAIL}</a>
        </p>
      </div>
    `);

    try {
      await transporter.sendMail({
        from: `"${BRAND}" <${cfg.from}>`,
        to: data.to,
        subject: `Votre contrat a ete signe - Confirmation de souscription`,
        html: clientHtml,
      });
      this.logger.log(`Subscription confirmation email sent to ${data.to}`);
    } catch (err) {
      this.logger.error(`Failed to send subscription confirmation to ${data.to}: ${err}`);
    }

    // ── Email to admin (notification) ──
    const adminEmail = cfg.from;
    const adminHtml = this.wrapEmail(`
      <h1 style="color:#000091;font-size:20px;margin:0 0 16px;">Nouvelle souscription signee</h1>
      <p style="color:#3A3A3A;font-size:15px;line-height:1.6;">
        Un nouveau contrat de location de defibrillateur vient d'etre signe.
      </p>

      <div style="background:#F6F6F6;border-radius:4px;padding:20px;margin:16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
          ${row("Client", fullName)}
          ${isOrg ? row("Societe", `${data.companyName} (SIRET: ${data.siret || "-"})`) : ""}
          ${row("Email", `<a href="mailto:${data.email}" style="color:#000091;">${data.email}</a>`)}
          ${row("Telephone", `<a href="tel:${data.mobile}" style="color:#000091;">${data.mobile}</a>`)}
          ${row("Lieu d'installation", installAddr)}
          ${row("Quantite", `${data.quantity} appareil(s)`)}
          ${row("Loyer", `${data.monthlyPriceHT} &euro; HT / ${data.monthlyPriceTTC} &euro; TTC par appareil/mois`)}
        </table>
      </div>

      <div style="background:#FFF3CD;border-left:4px solid #92400E;border-radius:4px;padding:12px 16px;margin-bottom:16px;">
        <p style="margin:0;font-size:13px;color:#92400E;">
          <strong>Action requise :</strong> Veuillez contacter le client pour organiser la livraison et l'installation.
        </p>
      </div>

      ${this.makeButton("Telecharger le contrat signe", downloadUrl)}
    `);

    try {
      await transporter.sendMail({
        from: `"${BRAND}" <${cfg.from}>`,
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
      .map((line: string) => (line.trim() === "" ? "<br/>" : `<p style="margin:0 0 8px;color:#3A3A3A;font-size:15px;line-height:1.6;">${line}</p>`))
      .join("\n");

    const html = this.wrapEmail(`
      <div style="background:#fef2f2;border-left:4px solid #E1000F;border-radius:4px;padding:16px;margin-bottom:24px;">
        <h1 style="color:#E1000F;font-size:18px;margin:0 0 4px;">Declaration annulee</h1>
        <p style="color:#929292;font-size:13px;margin:0;">
          Demande #${data.number} &mdash; ${data.exptRais || ""}
        </p>
      </div>

      <div style="margin-bottom:24px;">
        ${bodyHtml}
      </div>

      <div style="background:#F6F6F6;border-radius:4px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#929292;line-height:1.6;">
          <strong style="color:#3A3A3A;">Motif :</strong> ${data.reason}
        </p>
      </div>

      <div style="background:#F6F6F6;border-radius:4px;padding:16px;">
        <p style="margin:0;font-size:13px;color:#929292;line-height:1.6;">
          <strong style="color:#3A3A3A;">Besoin d'aide ?</strong><br/>
          Contactez notre equipe pour toute question relative a votre declaration.<br/>
          Email : <a href="mailto:${CONTACT_EMAIL}" style="color:#000091;">${CONTACT_EMAIL}</a>
        </p>
      </div>
    `);

    try {
      await transporter.sendMail({
        from: `"${BRAND}" <${cfg.from}>`,
        to: recipient,
        subject: `Declaration #${data.number} annulee - ${data.reason}`,
        html,
      });
      this.logger.log(
        `Declaration cancellation email sent to ${recipient}${isDev && recipient !== data.to ? ` (dev override, original: ${data.to})` : ""}`,
      );
    } catch (err) {
      this.logger.error(`Failed to send cancellation email: ${err}`);
    }
  }

  async sendGeodaeConfirmation(data: {
    contactEmail: string;
    userEmail: string | null;
    exptRais: string;
    exptNom: string;
    exptPrenom: string;
    declarationNumber: number;
    declarationId: string;
    devices: { nom: string; gid: number | null; updated: boolean }[];
  }): Promise<void> {
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();

    const deviceCount = data.devices.length;
    const plural = deviceCount > 1;
    const declUrl = `${this.frontendUrl}/dashboard/mes-declarations/${data.declarationId}`;

    const deviceRows = data.devices
      .map(
        (d) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E5E5;font-size:14px;color:#3A3A3A;">${d.nom || "DAE"}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E5E5;font-size:14px;color:#929292;">${d.gid ? `#${d.gid}` : "-"}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E5E5;font-size:14px;color:#18753C;">${d.updated ? "Mis a jour" : "Enregistre"}</td>
          </tr>`,
      )
      .join("");

    const html = this.wrapEmail(`
      <div style="background:#e8f5e9;border-left:4px solid #18753C;border-radius:4px;padding:16px;margin-bottom:24px;">
        <h1 style="color:#18753C;font-size:20px;margin:0 0 4px;">
          ${plural ? "Vos defibrillateurs sont enregistres" : "Votre defibrillateur est enregistre"} dans la base nationale
        </h1>
        <p style="color:#929292;font-size:13px;margin:0;">
          Demande #${data.declarationNumber} &mdash; ${data.exptRais || ""}
        </p>
      </div>

      <p style="color:#3A3A3A;font-size:15px;line-height:1.6;margin-bottom:24px;">
        Bonjour ${data.exptPrenom || ""} ${data.exptNom || ""},<br/><br/>
        ${plural ? `${deviceCount} defibrillateurs ont ete synchronises` : "Votre defibrillateur a ete synchronise"}
        avec succes dans la base nationale Geo'DAE pour la declaration
        <strong>${data.exptRais || ""}</strong> (demande #${data.declarationNumber}).
      </p>

      <div style="background:#F6F6F6;border-radius:4px;padding:20px;margin-bottom:24px;">
        <h2 style="font-size:16px;color:#000091;margin:0 0 12px;">
          ${plural ? "Defibrillateurs enregistres" : "Defibrillateur enregistre"}
        </h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
          <tr style="background:#E5E5E5;">
            <td style="padding:8px 12px;font-weight:700;font-size:13px;color:#3A3A3A;">Nom du DAE</td>
            <td style="padding:8px 12px;font-weight:700;font-size:13px;color:#3A3A3A;">N&deg; Geo'DAE</td>
            <td style="padding:8px 12px;font-weight:700;font-size:13px;color:#3A3A3A;">Statut</td>
          </tr>
          ${deviceRows}
        </table>
      </div>

      <p style="color:#3A3A3A;font-size:14px;line-height:1.6;margin-bottom:24px;">
        ${plural ? "Vos defibrillateurs sont desormais" : "Votre defibrillateur est desormais"}
        visibles par les services de secours et les citoyens via l'application SAUV Life et les centres d'appels d'urgence.
      </p>

      ${this.makeButton("Voir ma declaration", declUrl, "#18753C")}

      <div style="background:#F6F6F6;border-radius:4px;padding:16px;">
        <p style="margin:0;font-size:13px;color:#929292;line-height:1.6;">
          <strong style="color:#3A3A3A;">Besoin d'aide ?</strong><br/>
          Email : <a href="mailto:${CONTACT_EMAIL}" style="color:#000091;">${CONTACT_EMAIL}</a>
        </p>
      </div>
    `);

    const subject = `Confirmation de declaration Geo'DAE - Demande #${data.declarationNumber}`;

    // Send to contact email (exptEmail)
    const contactRecipient = await this.devRecipient(data.contactEmail);
    try {
      await transporter.sendMail({
        from: `"${BRAND}" <${cfg.from}>`,
        to: contactRecipient,
        subject,
        html,
      });
      this.logger.log(`GeoDAE confirmation sent to contact ${data.contactEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send GeoDAE confirmation to ${data.contactEmail}: ${err}`);
    }

    // Send to user account email if different
    if (
      data.userEmail &&
      data.userEmail.toLowerCase() !== data.contactEmail.toLowerCase()
    ) {
      const userRecipient = await this.devRecipient(data.userEmail);
      try {
        await transporter.sendMail({
          from: `"${BRAND}" <${cfg.from}>`,
          to: userRecipient,
          subject,
          html,
        });
        this.logger.log(`GeoDAE confirmation sent to user ${data.userEmail}`);
      } catch (err) {
        this.logger.error(`Failed to send GeoDAE confirmation to ${data.userEmail}: ${err}`);
      }
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
    const transporter = await this.getTransporter();
    const cfg = await this.getSmtpConfig();
    const recipient = await this.devRecipient(to);

    try {
      await transporter.sendMail({
        from: `"${BRAND}" <${cfg.from}>`,
        to: recipient,
        subject: `Reinitialisation de votre mot de passe - ${BRAND}`,
        html: this.wrapEmail(`
          <h1 style="color:#000091;font-size:22px;margin:0 0 16px;">Reinitialisation du mot de passe</h1>
          <p style="color:#3A3A3A;font-size:15px;line-height:1.6;">
            Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en creer un nouveau.
          </p>
          ${this.makeButton("Reinitialiser mon mot de passe", resetUrl)}
          <p style="color:#929292;font-size:12px;line-height:1.5;">
            Ce lien expire dans 1 heure. Si vous n'avez pas demande cette reinitialisation, ignorez cet email.<br/>
            <a href="${resetUrl}" style="color:#000091;word-break:break-all;">${resetUrl}</a>
          </p>
        `),
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}: ${err}`);
      throw err;
    }
  }
}
