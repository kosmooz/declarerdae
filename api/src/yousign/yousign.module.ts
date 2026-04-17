import { Module } from "@nestjs/common";
import { YousignController } from "./yousign.controller";
import { YousignService } from "./yousign.service";

@Module({
  controllers: [YousignController],
  providers: [YousignService],
  exports: [YousignService],
})
export class YousignModule {}
