import { Injectable } from "@nestjs/common";
import { DeviceDto, StateDto } from "shared";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class DevicesService {
  private readonly states: {[deviceId: string]:string}= {};

constructor(private readonly config: ConfigService){}

  getAll(): DeviceDto[] {
    this.config.devices.devices.flatMap(deviceConfig =>{
      const state = this.getState(deviceConfig.id);
      if (state===undefined) return []
      return [new DeviceDto(deviceConfig.id, deviceConfig.type, deviceConfig.name, state)]
    })

    return this.devices;
  }

  getState(deviceId:string):StateDto|undefined{
let stateId:string |undefined = undefined;

    if (!(deviceId in this.states)){
      const deviceConfig =  this.config.getDevice(deviceId);
      if (deviceConfig===undefined) return undefined;
      stateId= deviceConfig.defaultState
    }

    const deviceConfig = this.config.getDevice(deviceId)
    if (deviceConfig ===undefined) return undefined;

    stateId = this.states[deviceId];
    if (!(stateId in deviceConfig.states))throw `State ${stateId} is not a state of device ${deviceId}!`
    
    const state = deviceConfig.states[stateId]

    return new StateDto(stateId, state.name, state.imageUrl)
  }

  updateState(deviceId: string, stateId: string): void {
      if (this.devices)
  }
}
