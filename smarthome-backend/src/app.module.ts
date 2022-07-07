import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "./config/config.service";
import { DevicesController } from "./devices/devices.controller";
import { DevicesService } from "./devices/devices.service";

@Module({
  imports: [],
  controllers: [DevicesController],
  providers: [ConfigService, DevicesService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private config: ConfigService) {}

  onModuleInit() {
    try {
      this.config.load();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
