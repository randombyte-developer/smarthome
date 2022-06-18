import { JTDSchemaType } from "ajv/dist/jtd";
import { Identifiable } from "./identifiable";
import { StateConfig, StateDto } from "./state";
export interface DeviceDto {
    readonly id: string;
    readonly type: string;
    readonly name: string;
    readonly state: StateDto;
}
export declare const deviceDtoSchema: JTDSchemaType<DeviceDto>;
export interface DeviceConfig extends Identifiable {
    readonly type: string;
    readonly name: string;
    readonly address: string;
    readonly states: StateConfig[];
    readonly defaultState: string;
    readonly tasmotaSetupCommand?: string;
}
export declare const deviceConfigSchema: JTDSchemaType<DeviceConfig>;
export interface DevicesConfig {
    readonly devices: Array<DeviceConfig>;
}
export declare const devicesConfigSchema: JTDSchemaType<DevicesConfig>;
