import { Injectable, Logger } from "@nestjs/common";
import { DeviceDto, StateDto } from "shared";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  private readonly states: { [deviceId: string]: string } = {};

  constructor(private readonly config: ConfigService) {}

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

  updateState(deviceId: string, stateId: string): void {
    const device = this.config.getDevice(deviceId);
    if (!(stateId in device.states)) throw `Unknown state ${stateId} for device ${deviceId}!`;

    this.logger.log(`Updating state of device ${deviceId} to ${stateId}`);

    if (this.getState(deviceId).id === stateId) {
      this.logger.log(`State of device ${deviceId} is unchanged`);
      return;
    }

    this.states[deviceId] = stateId;
  }
}
