import { Injectable, BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "uploads");
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const MAX_SIZE_IMAGE = 5 * 1024 * 1024;
const MAX_SIZE_VIDEO = 50 * 1024 * 1024;
const MAX_SIZE_DOCUMENT = 20 * 1024 * 1024;

const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

@Injectable()
export class UploadService {
  constructor() {
    if (!existsSync(UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  validateFiles(files: Express.Multer.File[]) {
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Type non supporte: ${file.mimetype}. Types acceptes: jpg, png, webp, gif, mp4, webm, mov, pdf, zip, docx, xlsx, pptx`,
        );
      }
      const isVideo = file.mimetype.startsWith("video/");
      const isDocument = DOCUMENT_TYPES.has(file.mimetype);
      const maxSize = isVideo
        ? MAX_SIZE_VIDEO
        : isDocument
          ? MAX_SIZE_DOCUMENT
          : MAX_SIZE_IMAGE;
      const maxLabel = isVideo ? "50MB" : isDocument ? "20MB" : "5MB";
      if (file.size > maxSize) {
        throw new BadRequestException(
          `Fichier trop volumineux (max ${maxLabel}): ${file.originalname}`,
        );
      }
    }
  }

  getUploadedUrls(files: Express.Multer.File[]): { urls: string[] } {
    return { urls: files.map((file) => `/api/uploads/${file.filename}`) };
  }

  static getStorageConfig() {
    return {
      destination: UPLOADS_DIR,
      filename: (
        _req: any,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
      ) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
      },
    };
  }
}
