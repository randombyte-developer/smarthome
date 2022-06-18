import { Module } from "@nestjs/common";
import { ConfigService } from "./config/config.service";
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';

@Module({
  imports: [],
  controllers: [DevicesController],
  providers: [ConfigService, DevicesService],
})
export class AppModule {}
