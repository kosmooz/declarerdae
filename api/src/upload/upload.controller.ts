import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UploadService } from "./upload.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Upload")
@Controller("upload")
export class UploadController {
  constructor(private uploadService: UploadService) {}

  /** Public single-file upload (declaration photos, no auth required) */
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage(UploadService.getStorageConfig()),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFiles([file]);
    return { url: `/api/uploads/${file.filename}` };
  }

  @Post("images")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: diskStorage(UploadService.getStorageConfig()),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    this.uploadService.validateFiles(files);
    return this.uploadService.getUploadedUrls(files);
  }
}
