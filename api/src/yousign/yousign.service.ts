import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateSignatureDto } from "./dto/create-signature.dto";
import axios, { AxiosInstance } from "axios";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Decimal } from "@prisma/client/runtime/library";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class YousignService {
  private readonly logger = new Logger(YousignService.name);
  private readonly client: AxiosInstance;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {
    const baseURL = this.config.get<string>("YOUSIGN_BASE_URL");
    const apiKey = this.config.get<string>("YOUSIGN_API_KEY");

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async createSignatureRequest(dto: CreateSignatureDto, ip: string) {
    // 1. Create or update subscription in DB
    let subscription: any;

    if (dto.subscriptionId) {
      // Use existing draft
      const existing = await this.prisma.subscription.findUnique({
        where: { id: dto.subscriptionId },
      });

      if (!existing || existing.status !== "DRAFT") {
        // Fallback: create new if draft not found or not in DRAFT status
        subscription = await this.prisma.subscription.create({
          data: {
            quantity: dto.quantity,
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
            monthlyPriceHT: new Decimal(dto.monthlyPriceHT),
            monthlyPriceTTC: new Decimal(dto.monthlyPriceTTC),
            step: 3,
            status: "DRAFT",
          },
        });
      } else {
        // Update the existing draft with full data + pricing
        subscription = await this.prisma.subscription.update({
          where: { id: dto.subscriptionId },
          data: {
            quantity: dto.quantity,
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
            monthlyPriceHT: new Decimal(dto.monthlyPriceHT),
            monthlyPriceTTC: new Decimal(dto.monthlyPriceTTC),
            step: 3,
          },
        });
      }
    } else {
      // No existing draft — create new (backward-compatible)
      subscription = await this.prisma.subscription.create({
        data: {
          quantity: dto.quantity,
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
          monthlyPriceHT: new Decimal(dto.monthlyPriceHT),
          monthlyPriceTTC: new Decimal(dto.monthlyPriceTTC),
          step: 3,
          status: "DRAFT",
        },
      });
    }

    // 2. Generate PDF contract
    const { pdfBytes, signaturePage, signatureY } =
      await this.generateContractPdf(dto);

    // 3. Create Yousign signature request
    const label =
      dto.entityType === "organisation"
        ? dto.companyName
        : `${dto.firstName} ${dto.lastName}`;

    const { data: sigReq } = await this.client.post("/signature_requests", {
      name: `Contrat STAR aid - ${label}`,
      delivery_mode: "none",
      timezone: "Indian/Reunion",
    });

    // 4. Upload PDF document — capture document ID
    const formData = new FormData();
    const pdfBuffer = Buffer.from(pdfBytes);
    formData.append(
      "file",
      new Blob([pdfBuffer], { type: "application/pdf" }),
      `contrat-staraid-${subscription.id}.pdf`,
    );
    formData.append("nature", "signable_document");

    const { data: docData } = await this.client.post(
      `/signature_requests/${sigReq.id}/documents`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    const documentId = docData.id;

    // 5. Add signer (with E.164 phone format)
    const { data: signer } = await this.client.post(
      `/signature_requests/${sigReq.id}/signers`,
      {
        info: {
          first_name: dto.firstName,
          last_name: dto.lastName,
          email: dto.email,
          phone_number: this.formatPhoneE164(dto.mobile),
          locale: "fr",
        },
        signature_level: "electronic_signature",
        signature_authentication_mode: "otp_sms",
      },
    );

    // 6. Add signature field on the correct page
    await this.client.post(
      `/signature_requests/${sigReq.id}/documents/${documentId}/fields`,
      {
        type: "signature",
        page: signaturePage,
        signer_id: signer.id,
        x: 80,
        y: signatureY,
        width: 200,
        height: 60,
      },
    );

    // 7. Activate the signature request
    await this.client.post(`/signature_requests/${sigReq.id}/activate`);

    // 8. Retrieve signer to get signature_link (only available after activation)
    const { data: activatedSigner } = await this.client.get(
      `/signature_requests/${sigReq.id}/signers/${signer.id}`,
    );

    // 9. Update subscription with Yousign IDs
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        signatureRequestId: sigReq.id,
        signerId: signer.id,
        documentId,
        status: "PENDING_SIGNATURE",
      },
    });

    return {
      subscriptionId: subscription.id,
      signatureRequestId: sigReq.id,
      signerId: signer.id,
      signatureLink: activatedSigner.signature_link,
    };
  }

  async sendOtp(signatureRequestId: string, signerId: string) {
    await this.client.post(
      `/signature_requests/${signatureRequestId}/signers/${signerId}/send_otp`,
    );
    return { success: true };
  }

  async sign(
    signatureRequestId: string,
    signerId: string,
    otp: string,
    ip: string,
  ) {
    await this.client.post(
      `/signature_requests/${signatureRequestId}/signers/${signerId}/sign`,
      {
        otp,
        ip_address: ip,
        consent_given_at: new Date().toISOString(),
      },
    );

    // Update subscription status
    await this.prisma.subscription.updateMany({
      where: { signatureRequestId },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
      },
    });

    return { success: true };
  }

  async getSignatureStatus(signatureRequestId: string) {
    const { data } = await this.client.get(
      `/signature_requests/${signatureRequestId}`,
    );

    const status = data.status; // "draft" | "ongoing" | "done" | "expired" | "canceled"

    // If done, update our DB + send confirmation email (only if not already SIGNED)
    if (status === "done") {
      const sub = await this.prisma.subscription.findFirst({
        where: { signatureRequestId },
      });

      if (sub && sub.status !== "SIGNED") {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: "SIGNED",
            signedAt: new Date(),
          },
        });

        // Send confirmation email (async, don't block the response)
        this.mailService
          .sendSubscriptionConfirmation({
            to: sub.email ?? "",
            firstName: sub.firstName ?? "",
            lastName: sub.lastName ?? "",
            entityType: sub.entityType ?? "",
            companyName: sub.companyName ?? undefined,
            siret: sub.siret ?? undefined,
            companyAddress: sub.companyAddress ?? undefined,
            companyPostalCode: sub.companyPostalCode ?? undefined,
            companyCity: sub.companyCity ?? undefined,
            fonction: sub.fonction ?? undefined,
            mobile: sub.mobile ?? "",
            email: sub.email ?? "",
            installAddress: sub.installAddress ?? "",
            installAddressComplement: sub.installAddressComplement ?? undefined,
            installPostalCode: sub.installPostalCode ?? "",
            installCity: sub.installCity ?? "",
            quantity: sub.quantity,
            monthlyPriceHT: sub.monthlyPriceHT?.toString() ?? "0",
            monthlyPriceTTC: sub.monthlyPriceTTC?.toString() ?? "0",
            signatureRequestId,
          })
          .catch((err) =>
            this.logger.error(`Failed to send confirmation email: ${err}`),
          );
      }
    }

    return { status };
  }

  async downloadSignedPdf(signatureRequestId: string) {
    const { data } = await this.client.get(
      `/signature_requests/${signatureRequestId}/documents/download`,
      { responseType: "arraybuffer" },
    );
    return data;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  private formatPhoneE164(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("262")) return `+${cleaned}`;
    if (cleaned.startsWith("0")) return `+262${cleaned.slice(1)}`;
    return `+${cleaned}`;
  }

  // ─── PDF Generation ──────────────────────────────────────────────────

  private async generateContractPdf(
    dto: CreateSignatureDto,
  ): Promise<{ pdfBytes: Uint8Array; signaturePage: number; signatureY: number }> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);
    const fontBoldItalic = await doc.embedFont(
      StandardFonts.HelveticaBoldOblique,
    );

    const red = rgb(0.851, 0.176, 0.125); // #d92d20
    const black = rgb(0, 0, 0);
    const gray = rgb(0.3, 0.3, 0.3);

    const PAGE_W = 595;
    const PAGE_H = 842;
    const MARGIN = 50;
    const TEXT_W = PAGE_W - 2 * MARGIN;

    // Load logo
    let logoImage: Awaited<ReturnType<typeof doc.embedJpg>> | null = null;
    try {
      const logoPath = path.join(__dirname, "..", "..", "assets", "logo-staraid.jpg");
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await doc.embedJpg(logoBytes);
    } catch (e) {
      this.logger.warn("Logo not found, skipping logo embedding");
    }

    // Dynamic values
    const dateStr = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const priceHT = dto.monthlyPriceHT;
    const priceTTC = dto.monthlyPriceTTC;
    const qty = dto.quantity;

    const isOrg = dto.entityType === "organisation";

    // ────────────────────────────────────────────────────────
    // Helper: wrap text into lines that fit a given width
    // ────────────────────────────────────────────────────────
    const wrapText = (
      text: string,
      f: typeof font,
      size: number,
      maxW: number,
    ): string[] => {
      const words = text.split(" ");
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (f.widthOfTextAtSize(test, size) > maxW) {
          if (current) lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    };

    // ────────────────────────────────────────────────────────
    // Helper: draw wrapped paragraph, return new Y position
    // ────────────────────────────────────────────────────────
    type DrawCtx = {
      page: ReturnType<typeof doc.addPage>;
      y: number;
    };

    const drawParagraph = (
      ctx: DrawCtx,
      text: string,
      f: typeof font,
      size: number,
      color = black,
      indent = 0,
    ): number => {
      const lines = wrapText(text, f, size, TEXT_W - indent);
      for (const line of lines) {
        if (ctx.y < MARGIN + 20) {
          ctx.page = doc.addPage([PAGE_W, PAGE_H]);
          ctx.y = PAGE_H - MARGIN;
        }
        ctx.page.drawText(line, {
          x: MARGIN + indent,
          y: ctx.y,
          size,
          font: f,
          color,
        });
        ctx.y -= size + 4;
      }
      return ctx.y;
    };

    const drawBullet = (
      ctx: DrawCtx,
      text: string,
      f: typeof font,
      size: number,
    ): number => {
      const bulletChar = "\u2022";
      ctx.page.drawText(bulletChar, {
        x: MARGIN + 15,
        y: ctx.y,
        size,
        font: f,
        color: black,
      });
      const lines = wrapText(text, f, size, TEXT_W - 30);
      for (const line of lines) {
        if (ctx.y < MARGIN + 20) {
          ctx.page = doc.addPage([PAGE_W, PAGE_H]);
          ctx.y = PAGE_H - MARGIN;
        }
        ctx.page.drawText(line, {
          x: MARGIN + 28,
          y: ctx.y,
          size,
          font: f,
          color: black,
        });
        ctx.y -= size + 3;
      }
      return ctx.y;
    };

    // ================================================================
    //  PAGE 1
    // ================================================================
    const ctx: DrawCtx = {
      page: doc.addPage([PAGE_W, PAGE_H]),
      y: PAGE_H - MARGIN,
    };

    // Logo
    if (logoImage) {
      const logoW = 180;
      const logoH =
        (logoImage.height / logoImage.width) * logoW;
      const logoX = (PAGE_W - logoW) / 2;
      ctx.page.drawImage(logoImage, {
        x: logoX,
        y: ctx.y - logoH,
        width: logoW,
        height: logoH,
      });
      ctx.y -= logoH + 25;
    }

    // Title
    const title = "CONTRAT DE LOCATION ET DE MAINTENANCE";
    const title2 = "DE DÉFIBRILLATEUR";
    const titleW = fontBold.widthOfTextAtSize(title, 14);
    ctx.page.drawText(title, {
      x: (PAGE_W - titleW) / 2,
      y: ctx.y,
      size: 14,
      font: fontBold,
      color: red,
    });
    ctx.y -= 20;
    const title2W = fontBold.widthOfTextAtSize(title2, 14);
    ctx.page.drawText(title2, {
      x: (PAGE_W - title2W) / 2,
      y: ctx.y,
      size: 14,
      font: fontBold,
      color: red,
    });
    ctx.y -= 30;

    // ── ENTRE LES SOUSSIGNÉS ──
    ctx.y = drawParagraph(
      ctx,
      "ENTRE LES SOUSSIGNÉS :",
      fontBold,
      11,
      red,
    );
    ctx.y -= 8;

    // LOUEUR (STAR GROUP - fixed info)
    ctx.y = drawParagraph(
      ctx,
      "La société STAR GROUP, société à responsabilité limitée au capital de 21 090,00 \u20AC, immatriculée au Registre du Commerce et des Sociétés de Saint-Denis sous le numéro 500 168 190 00022, dont le siège social est sis 4 allée des Primevères - Le Moufia - 97490 SAINTE-CLOTILDE (Réunion), représentée par ses gérants en exercice.",
      font,
      9,
      black,
    );
    ctx.y -= 5;
    ctx.y = drawParagraph(
      ctx,
      '(Ci-après dénommé le "LOUEUR")',
      fontBoldItalic,
      9,
      black,
    );
    ctx.y -= 8;
    ctx.y = drawParagraph(ctx, "ET", fontBold, 10, black);
    ctx.y -= 8;

    // LOCATAIRE (dynamic client info)
    if (isOrg) {
      let clientDesc = `La société ${dto.companyName || ""}`;
      if (dto.siret) clientDesc += `, SIRET ${dto.siret}`;
      if (dto.companyAddress) {
        clientDesc += `, dont le siège social est sis ${dto.companyAddress}, ${dto.companyPostalCode} ${dto.companyCity}`;
      }
      clientDesc += `, représentée par ${dto.firstName} ${dto.lastName}`;
      if (dto.fonction) clientDesc += `, ${dto.fonction}`;
      clientDesc += ".";
      ctx.y = drawParagraph(ctx, clientDesc, font, 9, black);
    } else {
      ctx.y = drawParagraph(
        ctx,
        `${dto.firstName} ${dto.lastName}, demeurant à ${dto.installAddress}, ${dto.installPostalCode} ${dto.installCity}.`,
        font,
        9,
        black,
      );
    }
    ctx.y -= 5;
    ctx.y = drawParagraph(
      ctx,
      '(Ci-après dénommé le "LOCATAIRE")',
      fontBoldItalic,
      9,
      black,
    );
    ctx.y -= 5;
    ctx.y = drawParagraph(ctx, "D'AUTRE PART,", fontBold, 9, black);
    ctx.y -= 5;
    ctx.y = drawParagraph(
      ctx,
      '(Ci-après encore dénommées collectivement les "PARTIES" ou individuellement une "PARTIE")',
      fontItalic,
      9,
      gray,
    );
    ctx.y -= 12;

    // Contact info
    ctx.y = drawParagraph(ctx, "Coordonnées du locataire :", fontBold, 9, black);
    ctx.y -= 2;
    ctx.y = drawParagraph(ctx, `Email : ${dto.email}`, font, 9, black);
    ctx.y = drawParagraph(ctx, `Téléphone : ${dto.mobile}`, font, 9, black);
    ctx.y = drawParagraph(
      ctx,
      `Lieu d'installation : ${dto.installAddress}${dto.installAddressComplement ? `, ${dto.installAddressComplement}` : ""}, ${dto.installPostalCode} ${dto.installCity}`,
      font,
      9,
      black,
    );
    ctx.y -= 12;

    // PRÉAMBULE
    ctx.y = drawParagraph(ctx, "PRÉAMBULE", fontBold, 11, red);
    ctx.y -= 6;
    ctx.y = drawParagraph(
      ctx,
      "Le LOUEUR est une société qui est l'un des fournisseurs majeurs de défibrillateurs dans la zone de l'Océan Indien ainsi qu'aux Antilles. Il gère un parc de défibrillateurs multimarques. Par ses connaissances certaines relatives aux premiers secours, il offre un accompagnement pertinent et adapté dans l'installation et la formation à l'utilisation du défibrillateur. Le LOUEUR possède également les compétences techniques et un personnel spécialement formé pour assurer le suivi et la maintenance adéquate des défibrillateurs fournis.",
      font,
      9,
      black,
    );
    ctx.y -= 6;
    ctx.y = drawParagraph(
      ctx,
      "Le LOCATAIRE s'est montré intéressé par les services et le savoir-faire du LOUEUR. Au terme de discussions menées directement entre elles sur l'ensemble des obligations et engagements qu'entraîne la mise à disposition du défibrillateur, les PARTIES sont convenues de conclure le contrat de location dont les termes sont ci-après arrêtés.",
      font,
      9,
      black,
    );
    ctx.y -= 15;

    // TITRE I
    ctx.y = drawParagraph(
      ctx,
      "TITRE I : RÉGIME JURIDIQUE",
      fontBold,
      11,
      red,
    );
    ctx.y -= 8;

    // Article 1
    ctx.y = drawParagraph(ctx, "Article 1 - Objet", fontBold, 10, black);
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      `Le présent contrat a pour objet la location de ${qty} défibrillateur${qty > 1 ? "s" : ""} du parc du LOUEUR au LOCATAIRE pour son(ses) site(s). La location susvisée comprend les services suivants :`,
      font,
      9,
      black,
    );
    ctx.y -= 3;

    // ================================================================
    //  PAGE 2 (auto-paginated by drawParagraph if needed)
    // ================================================================
    ctx.y = drawBullet(
      ctx,
      "La mise en conformité administrative immédiate du dossier (délivrance de l'attestation de démarche).",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "La mise à disposition physique du matériel.",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "La formation dématérialisée à l'utilisation.",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "La maintenance préventive et curative du défibrillateur.",
      font,
      9,
    );
    ctx.y -= 12;

    // Article 2
    ctx.y = drawParagraph(ctx, "Article 2 - Caution", fontBold, 10, black);
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Conformément à l'offre souscrite, aucun dépôt de garantie financier (caution) n'est exigé du LOCATAIRE lors de la mise à disposition du matériel. En contrepartie, la validité et l'exécution du présent contrat sont strictement conditionnées à la signature concomitante du Mandat de Prélèvement SEPA. Le LOCATAIRE s'engage à maintenir ce mandat actif. Tout rejet non régularisé sous huit (8) jours entraînera la résiliation de plein droit du contrat et la restitution immédiate du matériel sous astreinte.",
      font,
      9,
      black,
    );
    ctx.y -= 12;

    // Article 3
    ctx.y = drawParagraph(ctx, "Article 3 - Loyer", fontBold, 10, black);
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      `Le prix du loyer est fixé à ${priceHT} \u20AC HT (soit ${priceTTC} \u20AC TTC) par mois et par appareil. Le loyer est payable mensuellement et d'avance par Prélèvement Automatique SEPA. Le cycle de facturation est calé sur la date de signature du Procès-Verbal de Livraison. Les loyers sont dus pour des périodes mensuelles complètes courant de date à date (sans calcul au prorata temporis).`,
      font,
      9,
      black,
    );
    ctx.y -= 12;

    // Article 4
    ctx.y = drawParagraph(
      ctx,
      "Article 4 - Durée du contrat",
      fontBold,
      10,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "La signature électronique déclenche l'ouverture immédiate du dossier. Le contrat est conclu pour une durée indéterminée avec une période minimale incompressible d'un (1) mois, débutant à la signature du Procès-Verbal de Livraison.",
      font,
      9,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Au-delà du premier mois, le LOCATAIRE peut résilier à tout moment, sans pénalité, avec un préavis d'un (1) mois (par LRAR). La durée cumulée ne pourra excéder la limite de la garantie constructeur (durée de vie technique). À ce terme, un nouveau contrat sur un appareil neuf devra être convenu.",
      font,
      9,
      black,
    );
    ctx.y -= 12;

    // Article 5
    ctx.y = drawParagraph(ctx, "Article 5 - Résiliation", fontBold, 10, black);
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "En cas de non-paiement d'un loyer non régularisé dans les trente (30) jours suivant une notification écrite, le LOUEUR pourra résilier le contrat de plein droit par LRAR. Le défibrillateur devra être restitué sous peine d'une astreinte de 50 \u20AC par jour de retard.",
      font,
      9,
      black,
    );
    ctx.y -= 15;

    // TITRE II
    ctx.y = drawParagraph(
      ctx,
      "TITRE II : MISE À DISPOSITION ET FORMATION",
      fontBold,
      11,
      red,
    );
    ctx.y -= 8;

    // Article 6
    ctx.y = drawParagraph(
      ctx,
      "Article 6 - Détermination du défibrillateur",
      fontBold,
      10,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Tous les défibrillateurs en location sont fournis avec des électrodes et un kit de préparation RCP. Un état descriptif sera effectué lors de la livraison et figurera sur le procès-verbal.",
      font,
      9,
      black,
    );
    ctx.y -= 12;

    // Article 7
    ctx.y = drawParagraph(
      ctx,
      "Article 7 - Formation au fonctionnement",
      fontBold,
      10,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Le contrat comprend une formation dématérialisée visant l'acquisition des gestes de premiers secours. Les thèmes abordés incluent :",
      font,
      9,
      black,
    );
    ctx.y -= 3;
    ctx.y = drawBullet(
      ctx,
      "Reconnaître un Arrêt Cardio Respiratoire.",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "Faire un appel efficace aux secours.",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "Pratiquer le massage cardiaque (RCP).",
      font,
      9,
    );
    ctx.y = drawBullet(ctx, "Utiliser un défibrillateur.", font, 9);
    ctx.y -= 15;

    // TITRE III
    ctx.y = drawParagraph(
      ctx,
      "TITRE III : MAINTENANCE DU DÉFIBRILLATEUR",
      fontBold,
      11,
      red,
    );
    ctx.y -= 8;

    // Article 8
    ctx.y = drawParagraph(
      ctx,
      "Article 8 - Maintenance (Généralités)",
      fontBold,
      10,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Le LOUEUR s'engage à garantir une maintenance préventive et curative. Une assistance est disponible par email (assistance@star-aid.fr) de 06h00 à 17h00 (UTC+4) en semaine.",
      font,
      9,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Le LOCATAIRE s'engage à respecter les conditions d'utilisation et à tenir un registre des anomalies. L'accès au matériel doit être garanti aux techniciens (les reports de rendez-vous de moins de 72h seront facturés 89 \u20AC TTC).",
      font,
      9,
      black,
    );
    ctx.y -= 10;

    // 8.1
    ctx.y = drawParagraph(
      ctx,
      "8.1 Maintenance préventive",
      fontBold,
      9,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Elle comprend un (1) passage par an avec :",
      font,
      9,
      black,
    );
    ctx.y -= 2;
    ctx.y = drawBullet(
      ctx,
      "Vérification complète du défibrillateur.",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "Remplacement de la batterie sur site (en cas de dysfonctionnement).",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "Remplacement des électrodes à date de péremption.",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "Appel de contrôle sous 48h en cas de sollicitation de l'assistance.",
      font,
      9,
    );
    ctx.y -= 10;

    // 8.2
    ctx.y = drawParagraph(
      ctx,
      "8.2 Maintenance curative",
      fontBold,
      9,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "En cas de défaillance ou d'utilisation, le LOUEUR intervient sous 48 heures maximum pour :",
      font,
      9,
      black,
    );
    ctx.y -= 2;
    ctx.y = drawBullet(
      ctx,
      "Prêt immédiat d'un appareil de remplacement.",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "Remplacement de la batterie défectueuse.",
      font,
      9,
    );
    ctx.y = drawBullet(
      ctx,
      "Remplacement des électrodes et du kit de secourisme utilisés.",
      font,
      9,
    );
    ctx.y -= 10;

    // 8.3
    ctx.y = drawParagraph(
      ctx,
      "8.3 Exclusions et Limites de Responsabilité",
      fontBold,
      9,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Sont exclues de la maintenance gratuite (et feront l'objet d'une facturation) : l'utilisation anormale, le vandalisme, les variations électriques, ou l'utilisation de fournitures non agréées.",
      font,
      9,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "Le LOUEUR décline toute responsabilité pour les dommages indirects ou en cas de force majeure. L'indemnisation maximale réclamable au LOUEUR est plafonnée au montant d'une année de loyer.",
      font,
      9,
      black,
    );
    ctx.y -= 15;

    // TITRE IV
    ctx.y = drawParagraph(
      ctx,
      "TITRE IV : LITIGES ET JURIDICTION",
      fontBold,
      11,
      red,
    );
    ctx.y -= 8;

    // Article 9
    ctx.y = drawParagraph(ctx, "Article 9 - Médiation", fontBold, 10, black);
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "À l'exception des demandes relatives au paiement des loyers, tout différend sera soumis préalablement à une procédure de médiation auprès du Centre de Médiation et d'Arbitrage de la Réunion (CMAR).",
      font,
      9,
      black,
    );
    ctx.y -= 12;

    // Article 10
    ctx.y = drawParagraph(
      ctx,
      "Article 10 - Juridiction compétente",
      fontBold,
      10,
      black,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "En cas d'échec de la médiation, la juridiction territorialement compétente est celle de Saint-Denis de la Réunion.",
      font,
      9,
      black,
    );
    ctx.y -= 25;

    // ── SIGNATURE SECTION ──
    // Draw separator line
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y },
      end: { x: PAGE_W - MARGIN, y: ctx.y },
      thickness: 1,
      color: red,
    });
    ctx.y -= 20;

    const sigTitle = "FAIT ET SIGNÉ ÉLECTRONIQUEMENT";
    const sigTitleW = fontBold.widthOfTextAtSize(sigTitle, 12);
    ctx.page.drawText(sigTitle, {
      x: (PAGE_W - sigTitleW) / 2,
      y: ctx.y,
      size: 12,
      font: fontBold,
      color: red,
    });
    ctx.y -= 18;

    ctx.y = drawParagraph(
      ctx,
      `Date : ${dateStr}`,
      font,
      9,
      gray,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      `Signataire : ${dto.firstName} ${dto.lastName}${dto.fonction ? ` (${dto.fonction})` : ""}`,
      font,
      9,
      gray,
    );
    ctx.y -= 4;
    ctx.y = drawParagraph(
      ctx,
      "(L'identification, l'horodatage et la signature sécurisée des parties sont certifiés par la plateforme de signature électronique)",
      fontItalic,
      8,
      gray,
    );
    ctx.y -= 15;

    // Signature placeholder area (where Yousign will place the field)
    ctx.page.drawText("Signature du LOCATAIRE :", {
      x: MARGIN + 30,
      y: ctx.y,
      size: 9,
      font: fontBold,
      color: black,
    });

    // Track signature position for Yousign field placement
    // Yousign uses top-left origin: yousignY = PAGE_H - pdfLibY
    const signaturePage = doc.getPageCount();
    const signatureY = PAGE_H - ctx.y + 10; // offset below the label

    return {
      pdfBytes: await doc.save(),
      signaturePage,
      signatureY,
    };
  }
}
