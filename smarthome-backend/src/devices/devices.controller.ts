import { Controller, Get } from "@nestjs/common";
import { DeviceDto } from "shared";
import { ConfigService } from "src/config/config.service";
import { DevicesService } from "./devices.service";

@Controller("devices")
export class DevicesController {
  constructor(private readonly config: ConfigService, private readonly devices: DevicesService) {}

  @Get()
  get(): DeviceDto[] {
    return this.devices.getAll();
  }
}
