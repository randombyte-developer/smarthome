import { Injectable, Logger } from "@nestjs/common";
import Ajv from "ajv/dist/jtd";
import { plainToInstance } from "class-transformer";
import * as fs from "fs";
import path from "path";
import { env } from "process";
import { DeviceConfig, DevicesConfig, devicesConfigSchema, StateConfig } from "shared";

@Injectable()
export class ConfigService {
  private static configPathEnvVarName = "CONFIG_PATH";

  private readonly logger = new Logger(ConfigService.name);

  private readonly ajv = new Ajv();
  private readonly devicesConfigParser = this.ajv.compileParser<DevicesConfig>(devicesConfigSchema);

  private _devices?: DevicesConfig;

  public get devices(): DevicesConfig {
    if (this.devices === undefined) throw "Device config is not initialized!";
    return this.devices;
  }

  load(shouldExist = false): boolean {
    if (!fs.existsSync(this.getDevicesConfigPath())) {
      if (shouldExist) {
        this.logger.error(`Config at ${this.getDevicesConfigPath()} doesn't exist after saving!`);
        return false;
      }

      this.save();
      this.load(true);
    }

    const devices = this.devicesConfigParser(fs.readFileSync(this.getDevicesConfigPath(), "utf-8"));
    if (devices === undefined) {
      this.logger.error(`Invalid devices config: ${this.devicesConfigParser.message}`);
      return false;
    }

    if (!ConfigService.checkConfig(devices)) {
      this.logger.error("Invalid config!");
      return false;
    }

    this._devices = devices;

    return true;
  }

  save() {
    if (!ConfigService.checkConfig(this.devices)) {
      throw "Invalid config detected before saving!";
    }

    fs.writeFileSync(this.getDevicesConfigPath(), JSON.stringify(this.devices));
  }

  getDevice(id: string): DeviceConfig | undefined {
    return this.devices.devices.find((device) => device.id === id);
  }

  private getConfigPath() {
    return env[ConfigService.configPathEnvVarName] ?? "./config/";
  }

  private getDevicesConfigPath() {
    return path.join(this.getConfigPath(), "devices.json");
  }

  private loadDefaultConfig() {
    this._devices = {
      devices: [
        {
          id: "tasmota-1",
          type: "tasmota-relais",
          name: "Tastmota Socket 1",
          address: "192.168.2.21",
          states: [{ id: "on", name: "An", toggledId: "off", imageUrl: "/static/images/light-on.png" }],
          defaultState: "unknown",
        },
      ],
    };
  }

  private static checkConfig(devicesConfig: DevicesConfig): true | string {
    const deviceIds = devicesConfig.devices.map((device) => device.id);
    const deviceIdsAreUnique = deviceIds.length === new Set(deviceIds).size;
    if (!deviceIdsAreUnique) return `Device IDs are not unique!`;

    for (const device of devicesConfig.devices) {
      const stateIds = device.states.map((state) => state.id);
      const stateIdsAreUnique = stateIds.length === new Set(stateIds).size;
      if (!stateIdsAreUnique) return `State IDs for device ${device.id} are not unique!`;
    }

    const defaultStateDoesntExist = devicesConfig.devices.filter((device) => device.defaultState! in device.states);
    if (defaultStateDoesntExist.length !== 0) return `The following device(s) don't have a known default state: ${defaultStateDoesntExist.join(", ")}`;

    return true;
  }
}
