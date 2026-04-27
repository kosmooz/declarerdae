import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import Axios from "axios";

const axios = Axios.create({ timeout: 10_000 });
import { existsSync, readFileSync } from "fs";
import { join, extname } from "path";
import { mapDeviceToGeoJson } from "./geodae-mapper";
import { validateForGeodae } from "./geodae-validator";

const BASE_URL = "https://catalogue.atlasante.fr";
const RESOURCE_UUID = "8777a504-6c3e-4abe-8100-60bb58767faa";
const DATA_URL = `${BASE_URL}/api/data/${RESOURCE_UUID}`;
const UPLOADS_DIR = join(process.cwd(), "uploads");

export interface DeviceSendResult {
  deviceId: string;
  deviceName: string;
  success: boolean;
  gid?: number;
  updated?: boolean;
  error?: string;
}

@Injectable()
export class GeodaeService {
  private readonly logger = new Logger(GeodaeService.name);
  private sessionCookie: string | null = null;
  private sessionCookieTime: number = 0;
  private static readonly SESSION_TTL = 25 * 60 * 1000; // 25 min

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // ── Credentials ──────────────────────────────────────────────

  private async getCredentials(): Promise<{
    username: string;
    password: string;
  }> {
    const settings = await this.prisma.shopSettings.findFirst();
    if (!settings?.geodaeUsername || !settings?.geodaePassword) {
      throw new BadRequestException(
        "Identifiants GéoDAE non configurés. Allez dans Réglages > GéoDAE.",
      );
    }
    if (!settings.geodaeEnabled) {
      throw new BadRequestException(
        "L'intégration GéoDAE est désactivée dans les réglages.",
      );
    }
    return {
      username: settings.geodaeUsername,
      password: settings.geodaePassword,
    };
  }

  private async getSettings() {
    const settings = await this.prisma.shopSettings.findFirst();
    return {
      testMode: settings?.geodaeTestMode ?? true,
      enabled: settings?.geodaeEnabled ?? false,
      mntSiren: settings?.geodaeMntSiren || null,
      mntRais: settings?.geodaeMntRais || null,
    };
  }

  // ── Authentication ───────────────────────────────────────────

  private async authenticate(): Promise<void> {
    const { username, password } = await this.getCredentials();
    const basicAuth = Buffer.from(`${username}:${password}`).toString(
      "base64",
    );

    try {
      const response = await axios.post(
        `${BASE_URL}/api/login`,
        null,
        {
          headers: { Authorization: `Basic ${basicAuth}` },
          maxRedirects: 0,
          validateStatus: (s) => s < 500,
        },
      );

      if (response.status !== 200) {
        throw new BadRequestException(
          `Authentification GéoDAE échouée: ${response.data?.message || response.status}`,
        );
      }

      // Extract PHPSESSID from Set-Cookie header
      const cookies = response.headers["set-cookie"];
      if (cookies) {
        for (const cookie of cookies) {
          const match = cookie.match(/PHPSESSID=([^;]+)/);
          if (match) {
            this.sessionCookie = match[1];
            this.sessionCookieTime = Date.now();
            this.logger.log("GéoDAE session established");
            return;
          }
        }
      }

      throw new BadRequestException(
        "Authentification GéoDAE réussie mais aucun cookie de session reçu.",
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error("GéoDAE auth error", error?.message);
      throw new BadRequestException(
        `Erreur de connexion à GéoDAE: ${error?.message || "erreur réseau"}`,
      );
    }
  }

  /**
   * Execute a function with a valid session, retrying once on auth failure.
   */
  private async withSession<T>(fn: (cookie: string) => Promise<T>): Promise<T> {
    if (!this.sessionCookie || Date.now() - this.sessionCookieTime > GeodaeService.SESSION_TTL) {
      this.sessionCookie = null;
      await this.authenticate();
    }
    try {
      return await fn(this.sessionCookie!);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        this.logger.warn("GéoDAE session expired, re-authenticating");
        this.sessionCookie = null;
        await this.authenticate();
        return await fn(this.sessionCookie!);
      }
      throw error;
    }
  }

  // ── Test Connection ──────────────────────────────────────────

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      this.sessionCookie = null;
      await this.authenticate();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || "Erreur inconnue",
      };
    }
  }

  // ── CRUD Operations ──────────────────────────────────────────

  private async createDae(
    geoJson: any,
  ): Promise<{ gid: number }> {
    return this.withSession(async (cookie) => {
      const response = await axios.post(DATA_URL, geoJson, {
        headers: {
          "Content-Type": "application/json",
          Cookie: `PHPSESSID=${cookie}`,
        },
      });

      // Response success: [{"check":true,"msg":"OK inserted","gid":73831}]
      // Response error:   [{"check":false,"msg":"La saisie n'est autorisée que..."}]
      const result = response.data;
      if (Array.isArray(result) && result[0]) {
        if (result[0].check && result[0].gid) {
          return { gid: result[0].gid };
        }
        // GéoDAE returned an explicit error
        throw new Error(result[0].msg || JSON.stringify(result));
      }
      throw new Error(
        `Réponse inattendue de GéoDAE: ${JSON.stringify(result)}`,
      );
    });
  }

  private async updateDae(geoJson: any): Promise<void> {
    return this.withSession(async (cookie) => {
      const response = await axios.patch(DATA_URL, geoJson, {
        headers: {
          "Content-Type": "application/json",
          Cookie: `PHPSESSID=${cookie}`,
        },
      });

      // Response success: [{"check":true,"msg":"OK updated"}]
      // Response error:   [{"check":false,"msg":"..."}]
      const result = response.data;
      if (Array.isArray(result) && result[0]) {
        if (result[0].check) return;
        throw new Error(result[0].msg || JSON.stringify(result));
      }
      if (!Array.isArray(result) || !result[0]?.check) {
        throw new Error(
          `Échec mise à jour GéoDAE: ${JSON.stringify(result)}`,
        );
      }
    });
  }

  // ── Photo Conversion ─────────────────────────────────────────

  private photoToBase64(photoUrl: string | null): string | null {
    if (!photoUrl) return null;

    // photoUrl is like "/api/uploads/abc123.jpg"
    const filename = photoUrl.replace(/^\/api\/uploads\//, "");
    const filePath = join(UPLOADS_DIR, filename);

    if (!existsSync(filePath)) {
      this.logger.warn(`Photo non trouvée: ${filePath}`);
      return null;
    }

    const buffer = readFileSync(filePath);
    const ext = extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
    };
    const mime = mimeMap[ext] || "image/jpeg";

    return `data:${mime};base64,${buffer.toString("base64")}`;
  }

  // ── Main Orchestration ───────────────────────────────────────

  async sendDeclarationToGeodae(
    declarationId: string,
    initiatorId: string,
    deviceIds?: string[],
    allowedStatuses: string[] = ["VALIDATED"],
  ): Promise<DeviceSendResult[]> {
    // Load declaration with devices
    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: {
        daeDevices: { orderBy: { position: "asc" } },
      },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }

    if (!allowedStatuses.includes(declaration.status)) {
      throw new BadRequestException(
        "Cette déclaration ne peut pas être envoyée à GéoDAE dans son état actuel.",
      );
    }

    const settings = await this.getSettings();

    // Filter devices if specific IDs requested
    let devices = declaration.daeDevices;
    if (deviceIds && deviceIds.length > 0) {
      devices = devices.filter((d) => deviceIds.includes(d.id));
    }

    if (devices.length === 0) {
      throw new BadRequestException(
        "Aucun appareil à envoyer.",
      );
    }

    const results: DeviceSendResult[] = [];
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let di = 0; di < devices.length; di++) {
      // Throttle: 500ms between each API call to avoid rate-limiting
      if (di > 0) await delay(500);
      const device = devices[di];
      try {
        // Convert photos to base64
        const photo1Base64 = this.photoToBase64(device.photo1);
        const photo2Base64 = this.photoToBase64(device.photo2);

        // Pre-send validation
        const validationErrors = validateForGeodae(declaration, device, {
          mntSiren: settings.mntSiren,
          mntRais: settings.mntRais,
        });
        if (validationErrors.length > 0) {
          const msg = validationErrors
            .map((e) => `${e.label} : ${e.message}`)
            .join(" | ");
          throw new Error(`Données incomplètes : ${msg}`);
        }

        // Build GeoJSON payload
        const geoJson = mapDeviceToGeoJson(declaration, device, {
          testMode: settings.testMode,
          photo1Base64,
          photo2Base64,
          mntSiren: settings.mntSiren,
          mntRais: settings.mntRais,
        });

        let gid: number;
        let updated = false;

        if (device.geodaeGid) {
          // Update existing DAE
          await this.updateDae(geoJson);
          gid = device.geodaeGid;
          updated = true;
        } else {
          // Create new DAE
          const result = await this.createDae(geoJson);
          gid = result.gid;
        }

        // Update device with GéoDAE info
        await this.prisma.daeDevice.update({
          where: { id: device.id },
          data: {
            geodaeGid: gid,
            geodaeStatus: updated ? "UPDATED" : "SENT",
            geodaeLastSync: new Date(),
            geodaeLastError: null,
          },
        });

        // Audit log
        await this.prisma.declarationAuditLog.create({
          data: {
            declarationId: declaration.id,
            adminId: initiatorId,
            action: "GEODAE_SYNC",
            deviceId: device.id,
            deviceName: device.nom,
            newValue: `GID: ${gid}`,
            metadata: JSON.stringify({
              status: updated ? "UPDATED" : "SENT",
              gid,
              timestamp: new Date().toISOString(),
            }),
          },
        });

        results.push({
          deviceId: device.id,
          deviceName: device.nom || "Sans nom",
          success: true,
          gid,
          updated,
        });

        this.logger.log(
          `GéoDAE ${updated ? "updated" : "created"} device "${device.nom}" → GID ${gid}`,
        );
      } catch (error) {
        // Full detail for server logs
        const internalError =
          error?.response?.data
            ? JSON.stringify(error.response.data)
            : error?.message || "Erreur inconnue";

        // Sanitized message for client — no raw API response
        const clientError = error?.message?.startsWith("Données incomplètes")
          ? error.message
          : "Échec de la synchronisation GéoDAE. Veuillez réessayer.";

        // Update device with error
        await this.prisma.daeDevice.update({
          where: { id: device.id },
          data: {
            geodaeStatus: "FAILED",
            geodaeLastError: internalError.slice(0, 500),
          },
        });

        // Audit log for failure
        await this.prisma.declarationAuditLog.create({
          data: {
            declarationId: declaration.id,
            adminId: initiatorId,
            action: "GEODAE_SYNC",
            deviceId: device.id,
            deviceName: device.nom,
            metadata: JSON.stringify({
              status: "FAILED",
              error: internalError.slice(0, 500),
              timestamp: new Date().toISOString(),
            }),
          },
        });

        results.push({
          deviceId: device.id,
          deviceName: device.nom || "Sans nom",
          success: false,
          error: clientError,
        });

        this.logger.error(
          `GéoDAE failed for device "${device.nom}": ${internalError}`,
        );
      }
    }

    // Auto-transition COMPLETE -> VALIDATED if all devices synced successfully
    if (
      declaration.status === "COMPLETE" &&
      results.length > 0 &&
      results.every((r) => r.success)
    ) {
      // Check ALL devices in the declaration are now synced (not just the ones we just sent)
      const allDevices = await this.prisma.daeDevice.findMany({
        where: { declarationId },
        select: { geodaeStatus: true },
      });
      const allSynced = allDevices.every(
        (d) => d.geodaeStatus === "SENT" || d.geodaeStatus === "UPDATED",
      );

      if (allSynced) {
        await this.prisma.declaration.update({
          where: { id: declarationId },
          data: { status: "VALIDATED" },
        });

        await this.prisma.declarationAuditLog.create({
          data: {
            declarationId: declaration.id,
            adminId: initiatorId,
            action: "STATUS_CHANGE",
            fieldName: "status",
            oldValue: "COMPLETE",
            newValue: "VALIDATED",
            metadata: JSON.stringify({
              reason: "Auto-validated after successful GéoDAE sync",
              timestamp: new Date().toISOString(),
            }),
          },
        });

        this.logger.log(
          `Declaration ${declarationId} auto-validated after full GéoDAE sync`,
        );
      }
    }

    // ── Send confirmation email for successful syncs ──────────
    const successResults = results.filter((r) => r.success);
    if (successResults.length > 0) {
      let userEmail: string | null = null;
      if (declaration.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: declaration.userId },
          select: { email: true },
        });
        userEmail = user?.email || null;
      }

      this.mailService
        .sendGeodaeConfirmation({
          contactEmail: declaration.exptEmail || "",
          userEmail,
          exptRais: declaration.exptRais || "",
          exptNom: declaration.exptNom || "",
          exptPrenom: declaration.exptPrenom || "",
          declarationNumber: declaration.number,
          declarationId: declaration.id,
          devices: successResults.map((r) => ({
            nom: r.deviceName,
            gid: r.gid ?? null,
            updated: r.updated ?? false,
          })),
        })
        .catch((err) =>
          this.logger.error(`Failed to send GéoDAE confirmation email: ${err}`),
        );
    }

    return results;
  }

  // ── Retry Single Device ──────────────────────────────────────

  async retryDevice(
    deviceId: string,
    initiatorId: string,
    allowedStatuses: string[] = ["VALIDATED"],
  ): Promise<DeviceSendResult> {
    const device = await this.prisma.daeDevice.findUnique({
      where: { id: deviceId },
      include: { declaration: true },
    });

    if (!device) {
      throw new NotFoundException("Appareil introuvable");
    }

    if (!allowedStatuses.includes(device.declaration.status)) {
      throw new BadRequestException(
        "Cette déclaration ne peut pas être envoyée à GéoDAE dans son état actuel.",
      );
    }

    const results = await this.sendDeclarationToGeodae(
      device.declarationId,
      initiatorId,
      [deviceId],
      allowedStatuses,
    );

    return results[0];
  }

  // ── Get Status ───────────────────────────────────────────────

  async getStatus(declarationId: string) {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: {
        daeDevices: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            nom: true,
            geodaeGid: true,
            geodaeStatus: true,
            geodaeLastSync: true,
            geodaeLastError: true,
          },
        },
      },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }

    return declaration.daeDevices.map((d) => ({
      deviceId: d.id,
      deviceName: d.nom,
      gid: d.geodaeGid,
      status: d.geodaeStatus,
      lastSync: d.geodaeLastSync,
      lastError: d.geodaeLastError,
    }));
  }

  // ── Fetch single DAE from GéoDAE API ─────────────────────────

  async fetchDaeFromGeodae(gid: number): Promise<Record<string, any>> {
    await this.getCredentials(); // ensures enabled + configured

    return this.withSession(async (cookie) => {
      const response = await axios.get(`${DATA_URL}`, {
        params: { gid },
        headers: {
          Cookie: `PHPSESSID=${cookie}`,
        },
      });

      const data = response.data;

      // Response is a FeatureCollection with matching features
      if (
        data?.type === "FeatureCollection" &&
        Array.isArray(data.features) &&
        data.features.length > 0
      ) {
        return data.features[0].properties || {};
      }

      // Fallback: some API versions return an array
      if (Array.isArray(data) && data.length > 0) {
        return data[0].properties || data[0];
      }

      throw new NotFoundException(
        `Fiche GéoDAE #${gid} introuvable sur le serveur distant.`,
      );
    });
  }

  /** Fetch live GéoDAE data for a device by its local DB id */
  async fetchDeviceFromGeodae(deviceId: string): Promise<Record<string, any>> {
    const device = await this.prisma.daeDevice.findUnique({
      where: { id: deviceId },
    });
    if (!device) {
      throw new NotFoundException("Appareil introuvable");
    }
    if (!device.geodaeGid) {
      throw new BadRequestException(
        "Cet appareil n'a pas encore été envoyé vers GéoDAE.",
      );
    }
    return this.fetchDaeFromGeodae(device.geodaeGid);
  }

  // ── Delete single device from GéoDAE ─────────────────────────

  async deleteSingleDevice(
    deviceId: string,
    initiatorId: string,
  ): Promise<DeviceSendResult> {
    const device = await this.prisma.daeDevice.findUnique({
      where: { id: deviceId },
      include: { declaration: true },
    });

    if (!device) {
      throw new NotFoundException("Appareil introuvable");
    }

    if (!device.geodaeGid) {
      throw new BadRequestException(
        "Cet appareil n'a pas de fiche GéoDAE à supprimer.",
      );
    }

    const settings = await this.getSettings();
    const declaration = device.declaration;

    try {
      const overriddenDevice = {
        ...device,
        etatFonct: "Supprimé définitivement",
      };

      const geoJson = mapDeviceToGeoJson(declaration, overriddenDevice, {
        testMode: settings.testMode,
        photo1Base64: null,
        photo2Base64: null,
        mntSiren: settings.mntSiren,
        mntRais: settings.mntRais,
      });

      await this.updateDae(geoJson);

      await this.prisma.daeDevice.update({
        where: { id: deviceId },
        data: {
          geodaeStatus: "DELETED",
          geodaeLastSync: new Date(),
          geodaeLastError: null,
        },
      });

      await this.prisma.declarationAuditLog.create({
        data: {
          declarationId: declaration.id,
          adminId: initiatorId,
          action: "GEODAE_SYNC",
          deviceId: device.id,
          deviceName: device.nom,
          newValue: `Supprimé de GéoDAE (GID: ${device.geodaeGid})`,
          metadata: JSON.stringify({
            status: "DELETED",
            gid: device.geodaeGid,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      this.logger.log(
        `GéoDAE marked device "${device.nom}" (GID ${device.geodaeGid}) as "Supprimé définitivement"`,
      );

      return {
        deviceId: device.id,
        deviceName: device.nom || "Sans nom",
        success: true,
        gid: device.geodaeGid,
      };
    } catch (error) {
      const errorMsg =
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error?.message || "Erreur inconnue";

      await this.prisma.daeDevice.update({
        where: { id: deviceId },
        data: {
          geodaeLastError: `Échec suppression: ${errorMsg}`.slice(0, 500),
        },
      });

      return {
        deviceId: device.id,
        deviceName: device.nom || "Sans nom",
        success: false,
        error: errorMsg,
      };
    }
  }

  // ── Delete from GéoDAE (batch — admin) ──────────────────────

  /**
   * "Delete" DAE from GéoDAE by PATCHing etat_fonct to "Supprimé définitivement".
   * The GéoDAE API does not support DELETE — only GET, POST, PATCH.
   */
  async deleteFromGeodae(
    declarationId: string,
    initiatorId: string,
  ): Promise<DeviceSendResult[]> {
    const declaration = await this.prisma.declaration.findUnique({
      where: { id: declarationId },
      include: {
        daeDevices: { orderBy: { position: "asc" } },
      },
    });

    if (!declaration) {
      throw new NotFoundException("Déclaration introuvable");
    }

    const settings = await this.getSettings();

    // Only devices that have a GID can be "deleted"
    const devices = declaration.daeDevices.filter((d) => d.geodaeGid);

    if (devices.length === 0) {
      throw new BadRequestException(
        "Aucun DAE à supprimer de GéoDAE (aucun GID enregistré).",
      );
    }

    const results: DeviceSendResult[] = [];
    const delayMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let di = 0; di < devices.length; di++) {
      if (di > 0) await delayMs(500);
      const device = devices[di];
      try {
        // Build GeoJSON with etat_fonct overridden to "Supprimé définitivement"
        const overriddenDevice = {
          ...device,
          etatFonct: "Supprimé définitivement",
        };

        const geoJson = mapDeviceToGeoJson(declaration, overriddenDevice, {
          testMode: settings.testMode,
          photo1Base64: null, // no need to re-send photos for deletion
          photo2Base64: null,
          mntSiren: settings.mntSiren,
          mntRais: settings.mntRais,
        });

        await this.updateDae(geoJson);

        // Update local status
        await this.prisma.daeDevice.update({
          where: { id: device.id },
          data: {
            geodaeStatus: "DELETED",
            geodaeLastSync: new Date(),
            geodaeLastError: null,
          },
        });

        // Audit log
        await this.prisma.declarationAuditLog.create({
          data: {
            declarationId: declaration.id,
            adminId: initiatorId,
            action: "GEODAE_SYNC",
            deviceId: device.id,
            deviceName: device.nom,
            newValue: `Supprimé de GéoDAE (GID: ${device.geodaeGid})`,
            metadata: JSON.stringify({
              status: "DELETED",
              gid: device.geodaeGid,
              timestamp: new Date().toISOString(),
            }),
          },
        });

        results.push({
          deviceId: device.id,
          deviceName: device.nom || "Sans nom",
          success: true,
          gid: device.geodaeGid!,
        });

        this.logger.log(
          `GéoDAE marked device "${device.nom}" (GID ${device.geodaeGid}) as "Supprimé définitivement"`,
        );
      } catch (error) {
        const errorMsg =
          error?.response?.data
            ? JSON.stringify(error.response.data)
            : error?.message || "Erreur inconnue";

        await this.prisma.daeDevice.update({
          where: { id: device.id },
          data: {
            geodaeLastError: `Échec suppression: ${errorMsg}`.slice(0, 500),
          },
        });

        await this.prisma.declarationAuditLog.create({
          data: {
            declarationId: declaration.id,
            adminId: initiatorId,
            action: "GEODAE_SYNC",
            deviceId: device.id,
            deviceName: device.nom,
            metadata: JSON.stringify({
              status: "DELETE_FAILED",
              error: errorMsg.slice(0, 500),
              timestamp: new Date().toISOString(),
            }),
          },
        });

        results.push({
          deviceId: device.id,
          deviceName: device.nom || "Sans nom",
          success: false,
          error: errorMsg,
        });

        this.logger.error(
          `GéoDAE delete failed for device "${device.nom}": ${errorMsg}`,
        );
      }
    }

    return results;
  }
}
