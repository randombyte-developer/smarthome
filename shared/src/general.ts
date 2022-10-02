import { JTDSchemaType } from "ajv/dist/jtd";

export interface GeneralConfig {
  readonly selfUrl: string;
}

export const generalConfigSchema: JTDSchemaType<GeneralConfig> = {
  properties: {
    selfUrl: { type: "string" },
  },
};
