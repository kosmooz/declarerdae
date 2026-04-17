import { Module } from "@nestjs/common";
import { GeodaeController } from "./geodae.controller";
import { GeodaeService } from "./geodae.service";

@Module({
  controllers: [GeodaeController],
  providers: [GeodaeService],
  exports: [GeodaeService],
})
export class GeodaeModule {}
