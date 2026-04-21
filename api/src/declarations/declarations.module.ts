import { Module } from "@nestjs/common";
import { DeclarationsController } from "./declarations.controller";
import { DeclarationsService } from "./declarations.service";
import { GeodaeModule } from "../geodae/geodae.module";

@Module({
  imports: [GeodaeModule],
  controllers: [DeclarationsController],
  providers: [DeclarationsService],
  exports: [DeclarationsService],
})
export class DeclarationsModule {}
