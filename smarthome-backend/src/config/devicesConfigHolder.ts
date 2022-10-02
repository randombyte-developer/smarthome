import { DeviceConfig, DevicesConfig, devicesConfigSchema, deviceTypes, StateConfig } from "shared";
import { ConfigHolder } from "./configHolder";

export class DevicesConfigHolder extends ConfigHolder<DevicesConfig> {
  protected configSchema = devicesConfigSchema;

  protected defaultConfig = {
    devices: [
      {
        id: "tasmota-1",
        type: deviceTypes.tasmotaRelais,
        name: "Tastmota Socket 1",
        address: "192.168.2.21",
        states: [
          {
            id: "unknown",
            name: "Unbekannt",
            toggledId: "off",
            imageUrl: "/static/images/unknown.png",
          },
          {
            id: "on",
            name: "An",
            toggledId: "off",
            imageUrl: "/static/images/light-on.png",
          },
        ],
        defaultState: "unknown",
      },
    ],
  };

  protected check(config: DevicesConfig): string | null {
    const deviceIds = config.devices.map((device) => device.id);
    const deviceIdsAreUnique = deviceIds.length === new Set(deviceIds).size;
    if (!deviceIdsAreUnique) return `Device IDs are not unique!`;

    for (const device of config.devices) {
      const deviceTypeExists = Object.values(deviceTypes).includes(device.type);
      if (!deviceTypeExists) {
        return `Device ${device.id} has an unknown type: ${device.type}`;
      }

      const stateIds = device.states.map((state) => state.id);
      const stateIdsAreUnique = stateIds.length === new Set(stateIds).size;
      if (!stateIdsAreUnique) return `State IDs for device ${device.id} are not unique!`;

      const defaultStateExists = stateIds.includes(device.defaultState);
      if (!defaultStateExists) return `The default state ${device.defaultState} of device ${device.id} doesn't exist!`;
    }

    return null;
  }

  getDevice(id: string): DeviceConfig {
    const device = this.config.devices.find((device) => device.id === id);
    if (device === undefined) throw `Unkown device ${id}!`;
    return device;
  }

  getState(device: DeviceConfig, id: string): StateConfig | undefined {
    return device.states.find((state) => state.id === id);
  }
}
