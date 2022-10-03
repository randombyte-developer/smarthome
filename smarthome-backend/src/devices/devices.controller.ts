import { Controller, Get, Param, Post, Put } from "@nestjs/common";
import { DeviceDto, Routes } from "shared";
import { ConfigService } from "src/config/config.service";
import { DevicesService } from "./devices.service";

@Controller(Routes.devices)
export class DevicesController {
  constructor(private readonly config: ConfigService, private readonly devices: DevicesService) {}

  @Get()
  get(): DeviceDto[] {
    return this.devices.getAll();
  }

  @Post(Routes.setupWebhooks)
  async setupWebhooks(): Promise<void> {
    await this.devices.setupTasmotaRelaisWebhooks();
  }

  @Get(`:deviceId/${Routes.state}/:stateId`)
  async tasmotaWebhookCallback(@Param("deviceId") deviceId: string, @Param("stateId") stateId: string): Promise<void> {
    await this.devices.setState(deviceId, stateId);
  }

  @Put(`:deviceId/${Routes.state}/:stateId`)
  async setState(@Param("deviceId") deviceId: string, @Param("stateId") stateId: string): Promise<void> {
    await this.devices.setState(deviceId, stateId);
  }
}
