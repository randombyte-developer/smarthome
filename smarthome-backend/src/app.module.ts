import { HttpModule } from "@nestjs/axios";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "./config/config.service";
import { DevicesController } from "./devices/devices.controller";
import { DevicesService } from "./devices/devices.service";
import { TasmotaService } from "./tasmota/tasmota.service";

@Module({
  imports: [HttpModule],
  controllers: [DevicesController],
  providers: [ConfigService, DevicesService, TasmotaService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private config: ConfigService) {}

  onModuleInit(): void {
    try {
      this.config.load();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
