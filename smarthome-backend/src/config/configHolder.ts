import * as path from "path";
import { env } from "process";
import * as fs from "fs";
import { Logger } from "@nestjs/common";
import Ajv, { JTDParser, JTDSchemaType } from "ajv/dist/jtd";

export abstract class ConfigHolder<T> {
  private static configPathEnvVarName = "CONFIG_PATH";

  private readonly logger: Logger;
  private readonly ajv = new Ajv();

  private _configParser?: JTDParser<T> = undefined;
  private get configParser(): JTDParser<T> {
    return this._configParser !== undefined ? this._configParser : (this._configParser = this.ajv.compileParser<T>(this.configSchema));
  }

  private readonly name: string;

  protected abstract configSchema: JTDSchemaType<T>;
  protected abstract defaultConfig: T;

  private _config?: T = undefined;
  get config(): T {
    if (this._config === undefined) throw `Config ${this.name} is not initialized!`;
    return this._config;
  }
  set config(value) {
    this.logger.log("Checking config");
    const error = this.check(value);
    if (error !== null) {
      throw `Invalid config: ${error}`;
    }
    this.logger.log("Config is valid");
    this._config = value;
    this.save();
  }

  private get file(): string {
    return path.resolve(env[ConfigHolder.configPathEnvVarName] ?? "./config/", this.name);
  }

  constructor(name: string) {
    this.name = name;
    this.logger = new Logger(`${ConfigHolder.name} ${this.name}`);
  }

  load(shouldExist = false): void {
    this.logger.log("Loading config");

    // save default config if doesn't exist
    if (!fs.existsSync(this.file)) {
      this.logger.warn(`Config at ${this.file} doesn't exist!`);
      if (shouldExist) {
        throw `Config at ${this.file} doesn't exist after saving!`;
      }

      this.logger.log("Saving default config");
      this.config = this.defaultConfig;
      this.load(true);
      return;
    }

    const configJson = fs.readFileSync(this.file, "utf-8");
    const parsedConfig = this.configParser(configJson);
    if (parsedConfig === undefined) {
      this.logger.error(`Invalid config: ${this.configParser.message}`);
      this.renameInvalidConfig();
      return;
    }

    const errorMessage = this.check(parsedConfig);
    if (errorMessage !== null) {
      this.logger.error(`Invalid config: ${errorMessage}`);
      this.renameInvalidConfig();
      return;
    }

    this.logger.log("Loaded config");
    this.config = parsedConfig;
  }

  private save(): void {
    this.logger.log(`Saving config ${this.file}`);

    const folder = path.dirname(this.file);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    fs.writeFileSync(this.file, JSON.stringify(this.config, undefined, 2), { flag: "w" });
  }

  protected abstract check(config: T): string | null;

  private renameInvalidConfig(): void {
    const renamedConfig = `${this.file}.old`;
    this.logger.warn(`Renaming current invalid config to ${renamedConfig}`);
    fs.renameSync(this.file, renamedConfig);
    this.load(false);
  }
}
