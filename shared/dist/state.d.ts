import { JTDSchemaType } from "ajv/dist/jtd";
import { Identifiable } from "./identifiable";
export interface StateDto extends Identifiable {
    readonly name: string;
    readonly imageUrl: string;
}
export declare const stateDtoSchema: JTDSchemaType<StateDto>;
export interface StateConfig extends Identifiable {
    readonly name: string;
    readonly toggledId: string;
    readonly imageUrl: string;
}
export declare const stateConfigSchema: JTDSchemaType<StateConfig>;
