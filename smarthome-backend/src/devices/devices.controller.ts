import { Controller, Get, Post } from "@nestjs/common";
import { DeviceDto, deviceTypes } from "shared";
import { ConfigService } from "src/config/config.service";
import { DevicesService } from "./devices.service";

@Controller("devices")
export class DevicesController {
  constructor(private readonly config: ConfigService, private readonly devices: DevicesService) {}

  @Get()
  get(): DeviceDto[] {
    return this.devices.getAll();
  }

  @Post("setupWebhooks")
  setupWebhooks(): void {}
}
