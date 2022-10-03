import { Injectable, Logger } from "@nestjs/common";
import { DeviceConfig, DeviceDto, deviceTypes, StateConfig, StateDto } from "shared";
import { ConfigService } from "src/config/config.service";
import { UnknownRecordException } from "src/exceptions/unknownRecord.exception";
import { TasmotaService } from "src/tasmota/tasmota.service";

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  private readonly states: { [deviceId: string]: string } = {};

  constructor(private readonly config: ConfigService, private readonly tasmota: TasmotaService) {}

  getAll(): DeviceDto[] {
    return this.config.devices.config.devices.flatMap((deviceConfig) => {
      const state = this.getState(deviceConfig.id);
      return [{ id: deviceConfig.id, type: deviceConfig.type, name: deviceConfig.name, state: state }];
    });
  }

  getState(deviceId: string): StateDto {
    const deviceConfig = this.config.devices.getDevice(deviceId);

    if (!(deviceId in this.states)) {
      this.logger.log(`Device ${deviceId} has no current state, setting it to default state ${deviceConfig.defaultState}`);
      this.states[deviceId] = deviceConfig.defaultState;
    }

    const stateId = this.states[deviceId];
    const state = this.config.devices.getState(deviceConfig, stateId);

    return { id: state.id, name: state.name, imageUrl: state.imageUrl };
  }

  async setState(deviceId: string, stateId: string): Promise<void> {
    const device = this.config.devices.getDevice(deviceId);
    const state = this.config.devices.getState(device, stateId);

    this.logger.log(`Updating state of device ${deviceId} to ${stateId}`);

    if (this.getState(deviceId).id === stateId) {
      this.logger.log(`State of device ${deviceId} is unchanged`);
      return;
    }

    try {
      await this.updateStateInternal(device, state);
    } catch (exception) {
      this.logger.warn(`Can't update state of device ${deviceId} to ${stateId}: ${exception}`);
      return;
    }

    this.logger.log(`Updated state of device ${deviceId} to ${stateId}`);
    this.states[deviceId] = stateId;
  }

  private async updateStateInternal(device: DeviceConfig, state: StateConfig): Promise<void> {
    switch (device.type) {
      case deviceTypes.tasmotaRelais:
        await this.tasmota.sendPowerCommand(device.address, state.id);
        break;

      default:
        throw `Unknown device type ${device.type} for device ${device.id}!`;
    }
  }

  async setupTasmotaRelaisWebhooks(): Promise<void> {
    const tasmotaDevices = this.config.devices.config.devices.filter((device) => device.type == deviceTypes.tasmotaRelais);
    for (const device of tasmotaDevices) {
      await this.tasmota.setupRelaisWebhook(device.address, device.id, this.config.general.config.selfUrl);
    }
  }
}
