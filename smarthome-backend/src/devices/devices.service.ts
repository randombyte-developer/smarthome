import { Injectable, Logger } from "@nestjs/common";
import { DeviceConfig, DeviceDto, deviceTypes, StateConfig, StateDto } from "shared";
import { ConfigService } from "src/config/config.service";
import { TasmotaService } from "src/tasmota/tasmota.service";

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  private readonly states: { [deviceId: string]: string } = {};

  constructor(private readonly config: ConfigService, private readonly tasmota: TasmotaService) {}

  getAll(): DeviceDto[] {
    return this.config.devices.devices.flatMap((deviceConfig) => {
      const state = this.getState(deviceConfig.id);
      return [{ id: deviceConfig.id, type: deviceConfig.type, name: deviceConfig.name, state: state }];
    });
  }

  getState(deviceId: string): StateDto {
    const deviceConfig = this.config.getDevice(deviceId);

    if (!(deviceId in this.states)) {
      this.logger.log(`Device ${deviceId} has no current state, setting it to default state ${deviceConfig.defaultState}`);
      this.states[deviceId] = deviceConfig.defaultState;
    }

    const stateId = this.states[deviceId];
    const state = deviceConfig.states.find((state) => state.id === stateId);
    if (state === undefined) throw `State ${stateId} is not a state of device ${deviceId}!`;

    return { id: state.id, name: state.name, imageUrl: state.imageUrl };
  }

  async updateState(deviceId: string, stateId: string): Promise<void> {
    const device = this.config.getDevice(deviceId);

    const state = this.config.getState(device, stateId);
    if (state === undefined) throw `Unkown state ${stateId} for device ${device.id}!`;

    this.logger.log(`Updating state of device ${deviceId} to ${stateId}`);

    if (this.getState(deviceId).id === stateId) {
      this.logger.log(`State of device ${deviceId} is unchanged`);
      return;
    }

    const success = await this.updateStateInternal(device, state);

    if (!success) {
      this.logger.warn(`Can't update state of device ${deviceId} to ${stateId}!`);
      return;
    }

    this.logger.log(`Updated state of device ${deviceId} to ${stateId}`);
    this.states[deviceId] = stateId;
  }

  private updateStateInternal(device: DeviceConfig, state: StateConfig): Promise<boolean> {
    switch (device.type) {
      case deviceTypes.tasmotaRelais:
        return this.tasmota.sendPowerCommand(device.address, state.id);

      default:
        throw `Unkown device type ${device.type} for device ${device.id}!`;
    }
  }
}
