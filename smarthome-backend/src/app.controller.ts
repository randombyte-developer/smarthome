import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Device } from "shared";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    new Device("");
    return this.appService.getHello();
  }
}
