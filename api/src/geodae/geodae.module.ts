import { Module } from "@nestjs/common";
import { GeodaeController } from "./geodae.controller";
import { GeodaeService } from "./geodae.service";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [MailModule],
  controllers: [GeodaeController],
  providers: [GeodaeService],
  exports: [GeodaeService],
})
export class GeodaeModule {}
