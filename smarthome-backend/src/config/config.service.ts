import { Injectable, Logger } from "@nestjs/common";
import { DevicesConfigHolder } from "./devicesConfigHolder";
import { GeneralConfigHolder } from "./generalConfigHolder";

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  general = new GeneralConfigHolder("general.json");
  devices = new DevicesConfigHolder("devices.json");

  private configs = [this.general, this.devices];

  loadAll(): void {
    this.logger.log("Loading all configs");
    for (const config of this.configs) {
      config.load();
    }
  }
}
