import { Controller, Get, Param, Post, Put } from "@nestjs/common";
import { DeviceDto, Routes } from "shared";
import { DevicesService } from "./devices.service";

@Controller(Routes.devices)
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Get()
  get(): DeviceDto[] {
    return this.devices.getAllDevices();
  }

  @Post(Routes.setupWebhooks)
  async setupWebhooks(): Promise<void> {
    await this.devices.setupTasmotaRelaisWebhooks();
  }

  @Get(`:deviceId/${Routes.state}/:stateId`)
  async tasmotaWebhook(@Param("deviceId") deviceId: string, @Param("stateId") stateId: string): Promise<void> {
    await this.devices.tasmotaWebhook(deviceId, stateId);
  }

  @Put(`:deviceId/${Routes.state}/${Routes.toggle}`)
  async toggle(@Param("deviceId") deviceId: string): Promise<void> {
    await this.devices.toggle(deviceId);
  }
}
