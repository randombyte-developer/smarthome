import { Injectable, Logger } from "@nestjs/common";
import { DeviceConfig, DeviceDto, deviceTypes, StateConfig, StateDto } from "shared";
import { ConfigService } from "src/config/config.service";
import { TasmotaService } from "src/tasmota/tasmota.service";

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  private readonly states: { [deviceId: string]: string } = {};

  constructor(private readonly config: ConfigService, private readonly tasmota: TasmotaService) {}

  getAllDevices(): DeviceDto[] {
    return this.config.devices.config.devices.flatMap((deviceConfig) => {
      const stateConfig = this.getStateConfig(deviceConfig.id);
      return [
        {
          id: deviceConfig.id,
          type: deviceConfig.type,
          name: deviceConfig.name,
          state: {
            id: stateConfig.id,
            name: stateConfig.name,
            imageUrl: stateConfig.imageUrl,
          },
        },
      ];
    });
  }

  private getStateConfig(deviceId: string): StateConfig {
    const deviceConfig = this.config.devices.getDevice(deviceId);

    if (!(deviceId in this.states)) {
      this.logger.log(`Device ${deviceId} has no current state, setting it internally to default state ${deviceConfig.defaultState}`);
      this.states[deviceId] = deviceConfig.defaultState;
    }

    const stateId = this.states[deviceId];
    const stateConfig = this.config.devices.getState(deviceConfig, stateId);

    return stateConfig;
  }

  getState(deviceId: string): StateDto {
    const stateConfig = this.getStateConfig(deviceId);
    return {
      id: stateConfig.id,
      name: stateConfig.name,
      imageUrl: stateConfig.imageUrl,
    };
  }

  async tasmotaWebhook(deviceId: string, newStateId: string): Promise<void> {
    this.logger.log(`Webhook: Device ${deviceId} changed to state ${newStateId}`);

    const device = this.config.devices.getDevice(deviceId);
    const newState = this.config.devices.getState(device, newStateId); // checks if state exists

    this.states[deviceId] = newState.id;
    this.logger.log(`Webhook: Changed device ${deviceId} to state ${newStateId}`);
  }

  async setState(deviceId: string, newStateId: string): Promise<void> {
    this.logger.log(`Updating state of device ${deviceId} to ${newStateId}`);

    const device = this.config.devices.getDevice(deviceId);
    const newState = this.config.devices.getState(device, newStateId);

    if (this.getStateConfig(deviceId).id === newStateId) {
      this.logger.log(`State of device ${deviceId} is unchanged`);
      return;
    }

    try {
      await this.sendUpdateStateCommand(device, newState);
    } catch (exception) {
      this.logger.warn(`Can't update state of device ${deviceId} to ${newStateId}: ${exception}`);
      throw `Can't update state of device ${deviceId} to ${newStateId}!`;
    }

    this.logger.log(`Updated state of device ${deviceId} to ${newStateId}`);
    this.states[deviceId] = newStateId;
  }

  async toggle(deviceId: string): Promise<void> {
    this.logger.log(`Toggling state of device ${deviceId}`);
    const currentState = this.getStateConfig(deviceId);

    if (currentState.toggledId === null) {
      throw `Can't toggle device ${deviceId} because state ${currentState.id} is not togglable!`;
    }

    this.setState(deviceId, currentState.toggledId);
  }

  private async sendUpdateStateCommand(device: DeviceConfig, state: StateConfig): Promise<void> {
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
