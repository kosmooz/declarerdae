import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import helmet from "helmet";
import { join } from "path";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const logger = new Logger("HTTP");

  app.setGlobalPrefix("api");

  // CORS
  app.enableCors({
    origin: configService.get("CORS_ORIGIN", "http://localhost:3020"),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Helmet security headers
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production" ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use(cookieParser());

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Request logger
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/api/uploads",
  });

  // Swagger (dev only)
  if (process.env.NODE_ENV !== "production") {
    const { SwaggerModule, DocumentBuilder } = await import("@nestjs/swagger");
    const config = new DocumentBuilder()
      .setTitle("StarAid API")
      .setDescription("StarAid backend API documentation")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = configService.get("PORT", 3021);
  await app.listen(port);
  logger.log(`API running on http://localhost:${port}`);
}

bootstrap();
