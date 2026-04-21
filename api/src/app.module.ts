import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import * as Joi from "joi";
import { PrismaModule } from "./prisma/prisma.module";
import { MailModule } from "./mail/mail.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AdminModule } from "./admin/admin.module";
import { UploadModule } from "./upload/upload.module";
import { YousignModule } from "./yousign/yousign.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { DeclarationsModule } from "./declarations/declarations.module";
import { HealthModule } from "./health/health.module";
import { BlogModule } from "./blog/blog.module";
import { GeodaeModule } from "./geodae/geodae.module";
import { GdprModule } from "./gdpr/gdpr.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        FRONTEND_URL: Joi.string().default("http://localhost:3020"),
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        CORS_ORIGIN: Joi.string().default("http://localhost:3020"),
        PORT: Joi.number().default(3021),
        YOUSIGN_API_KEY: Joi.string().optional().allow(""),
        YOUSIGN_BASE_URL: Joi.string().optional().allow(""),
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    AdminModule,
    UploadModule,
    YousignModule,
    SubscriptionsModule,
    DeclarationsModule,
    HealthModule,
    BlogModule,
    GeodaeModule,
    GdprModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
