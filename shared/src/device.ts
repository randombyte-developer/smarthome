import { JTDSchemaType } from "ajv/dist/jtd";
import { Identifiable } from "./identifiable";
import { StateConfig, stateConfigSchema, StateDto, stateDtoSchema } from "./state";

export const deviceTypes = {
  tasmotaRelais: "tasmotaRelais",
  tasmotaRfBridge: "tasmotaRfBridge",
};

export interface DeviceDto {
  readonly id: string;
  readonly type: string;
  readonly name: string;
  readonly state: StateDto;
}

export const deviceDtoSchema: JTDSchemaType<DeviceDto> = {
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    name: { type: "string" },
    state: stateDtoSchema,
  },
};

export interface DeviceConfig extends Identifiable {
  readonly type: string;
  readonly name: string;
  readonly address: string;
  readonly states: StateConfig[];
  readonly defaultState: string;
  readonly tasmotaSetupCommand?: string;
}

export const deviceConfigSchema: JTDSchemaType<DeviceConfig> = {
  properties: {
    id: { type: "string" },
    type: { type: "string" },
    name: { type: "string" },
    address: { type: "string" },
    states: { elements: { ...stateConfigSchema } },
    defaultState: { type: "string" },
  },
  optionalProperties: {
    tasmotaSetupCommand: { type: "string" },
  },
};

export interface DevicesConfig {
  readonly devices: Array<DeviceConfig>;
}

export const devicesConfigSchema: JTDSchemaType<DevicesConfig> = {
  properties: {
    devices: { elements: { ...deviceConfigSchema } },
  },
};
