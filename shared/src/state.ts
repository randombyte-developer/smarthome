import { JTDSchemaType } from "ajv/dist/jtd";
import { Identifiable } from "./identifiable";

export interface StateDto extends Identifiable {
  readonly name: string;
  readonly imageUrl: string;
}

export const stateDtoSchema: JTDSchemaType<StateDto> = {
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    imageUrl: { type: "string" },
  },
};

export interface StateConfig extends Identifiable {
  readonly name: string;
  readonly toggledId: string;
  readonly imageUrl: string;
}

export const stateConfigSchema: JTDSchemaType<StateConfig> = {
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    toggledId: { type: "string" },
    imageUrl: { type: "string" },
  },
};
