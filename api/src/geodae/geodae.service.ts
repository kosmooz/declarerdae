import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";
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

  constructor(private readonly prisma: PrismaService) {}

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
    if (!this.sessionCookie) {
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
    adminId: string,
    deviceIds?: string[],
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

    if (declaration.status !== "VALIDATED") {
      throw new BadRequestException(
        "Seules les déclarations validées peuvent être envoyées à GéoDAE.",
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

    for (const device of devices) {
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
            adminId,
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
        const errorMsg =
          error?.response?.data
            ? JSON.stringify(error.response.data)
            : error?.message || "Erreur inconnue";

        // Update device with error
        await this.prisma.daeDevice.update({
          where: { id: device.id },
          data: {
            geodaeStatus: "FAILED",
            geodaeLastError: errorMsg.slice(0, 500),
          },
        });

        // Audit log for failure
        await this.prisma.declarationAuditLog.create({
          data: {
            declarationId: declaration.id,
            adminId,
            action: "GEODAE_SYNC",
            deviceId: device.id,
            deviceName: device.nom,
            metadata: JSON.stringify({
              status: "FAILED",
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
          `GéoDAE failed for device "${device.nom}": ${errorMsg}`,
        );
      }
    }

    return results;
  }

  // ── Retry Single Device ──────────────────────────────────────

  async retryDevice(
    deviceId: string,
    adminId: string,
  ): Promise<DeviceSendResult> {
    const device = await this.prisma.daeDevice.findUnique({
      where: { id: deviceId },
      include: { declaration: true },
    });

    if (!device) {
      throw new NotFoundException("Appareil introuvable");
    }

    if (device.declaration.status !== "VALIDATED") {
      throw new BadRequestException(
        "La déclaration doit être validée pour envoyer vers GéoDAE.",
      );
    }

    const results = await this.sendDeclarationToGeodae(
      device.declarationId,
      adminId,
      [deviceId],
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

  // ── Delete from GéoDAE ──────────────────────────────────────

  /**
   * "Delete" DAE from GéoDAE by PATCHing etat_fonct to "Supprimé définitivement".
   * The GéoDAE API does not support DELETE — only GET, POST, PATCH.
   */
  async deleteFromGeodae(
    declarationId: string,
    adminId: string,
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

    for (const device of devices) {
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
            adminId,
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
            adminId,
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
