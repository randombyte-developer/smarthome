import { Injectable, Logger } from "@nestjs/common";
import Ajv from "ajv/dist/jtd";
import * as fs from "fs";
import * as path from "path";
import { env } from "process";
import { DeviceConfig, DevicesConfig, devicesConfigSchema, deviceTypes, StateConfig } from "shared";

@Injectable()
export class ConfigService {
  private static configPathEnvVarName = "CONFIG_PATH";

  private readonly logger = new Logger(ConfigService.name);

  private readonly ajv = new Ajv();
  private readonly devicesConfigParser = this.ajv.compileParser<DevicesConfig>(devicesConfigSchema);

  private _devices?: DevicesConfig;

  private get configFolderPath(): string {
    return path.resolve(env[ConfigService.configPathEnvVarName] ?? "./config/");
  }

  private get devicesConfigPath(): string {
    return path.resolve(path.join(this.configFolderPath, "devices.json"));
  }

  public get devices(): DevicesConfig {
    if (this._devices === undefined) throw "Device config is not initialized!";
    return this._devices;
  }

  load(shouldExist = false): void {
    this.logger.log("Loading config");

    // save default config if doesn't exist
    if (!fs.existsSync(this.devicesConfigPath)) {
      this.logger.warn(`Config at ${this.devicesConfigPath} doesn't exist!`);
      if (shouldExist) {
        throw `Config at ${this.devicesConfigPath} doesn't exist after saving!`;
      }

      this.logger.log("Saving default config");
      this.loadDefaultConfig();
      this.save();
      this.load(true);
      return;
    }

    const devices = this.devicesConfigParser(fs.readFileSync(this.devicesConfigPath, "utf-8"));
    if (devices === undefined) {
      this.logger.error(`Invalid devices config: ${this.devicesConfigParser.message}`);
      this.renameInvalidConfig();
      return;
    }

    const errorMessage = ConfigService.checkConfig(devices);
    if (errorMessage !== undefined) {
      this.logger.error(`Invalid devices config: ${errorMessage}`);
      this.renameInvalidConfig();
      return;
    }

    this.logger.log("Loaded config");
    this._devices = devices;
  }

  save(): void {
    this.logger.log("Saving config");
    const errorMessage = ConfigService.checkConfig(this.devices);
    if (errorMessage !== undefined) {
      throw `Invalid config: ${errorMessage}`;
    }

    if (!fs.existsSync(this.configFolderPath)) {
      fs.mkdirSync(this.configFolderPath);
    }

    fs.writeFileSync(this.devicesConfigPath, JSON.stringify(this.devices, undefined, 2), { flag: "w" });
  }

  getDevice(id: string): DeviceConfig {
    const device = this.devices.devices.find((device) => device.id === id);
    if (device === undefined) throw `Unkown device ${id}!`;
    return device;
  }

  getState(device: DeviceConfig, id: string): StateConfig | undefined {
    return device.states.find((state) => state.id === id);
  }

  private loadDefaultConfig(): void {
    const defaultConfig = {
      devices: [
        {
          id: "tasmota-1",
          type: "tasmota-relais",
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

    const errorMessage = ConfigService.checkConfig(defaultConfig);
    if (errorMessage !== undefined) {
      throw `Invalid default config: ${errorMessage}`;
    }
    this._devices = defaultConfig;
  }

  private renameInvalidConfig() {
    const renamedConfig = `${this.devicesConfigPath}.old`;
    this.logger.warn(`Renaming current invalid config to ${renamedConfig}`);
    fs.renameSync(this.devicesConfigPath, renamedConfig);
    this.load(false);
  }

  private static checkConfig(devicesConfig: DevicesConfig): string | undefined {
    const deviceIds = devicesConfig.devices.map((device) => device.id);
    const deviceIdsAreUnique = deviceIds.length === new Set(deviceIds).size;
    if (!deviceIdsAreUnique) return `Device IDs are not unique!`;

    for (const device of devicesConfig.devices) {
      if (device.type! in Object.values(deviceTypes)) {
        return `Device ${device.id} has an unknown type: ${device.type}`;
      }
      const stateIds = device.states.map((state) => state.id);
      const stateIdsAreUnique = stateIds.length === new Set(stateIds).size;
      if (!stateIdsAreUnique) return `State IDs for device ${device.id} are not unique!`;
    }

    const defaultStateDoesntExist = devicesConfig.devices.filter((device) => device.defaultState! in device.states);
    if (defaultStateDoesntExist.length !== 0) return `The following device(s) don't have a known default state: ${defaultStateDoesntExist.join(", ")}`;

    return undefined;
  }
}
