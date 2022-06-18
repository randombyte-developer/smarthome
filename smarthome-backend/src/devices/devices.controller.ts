import { Controller, Get } from "@nestjs/common";
import { DeviceDto } from "shared";
import { ConfigService } from "src/config/config.service";

@Controller("devices")
export class DevicesController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  get(): DeviceDto[] {
    this.config.devices;
  }
}
