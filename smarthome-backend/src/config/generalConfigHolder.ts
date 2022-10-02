import { GeneralConfig, generalConfigSchema } from "shared";
import { ConfigHolder } from "./configHolder";

export class GeneralConfigHolder extends ConfigHolder<GeneralConfig> {
  protected configSchema = generalConfigSchema;

  protected defaultConfig = {
    selfUrl: "192.168.2.10",
  };

  protected check(config: GeneralConfig): string | null {
    return null;
  }
}
