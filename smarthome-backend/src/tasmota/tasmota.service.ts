import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { catchError, lastValueFrom, map, of } from "rxjs";
import { commonStateIds, Routes } from "shared";

@Injectable()
export class TasmotaService {
  constructor(private readonly http: HttpService) {}

  async sendPowerCommand(address: string, state: string): Promise<void> {
    return await this.sendCommand(address, `Power1 ${state}`);
  }

  async sendCommand(address: string, command: string): Promise<void> {
    const success = await lastValueFrom(
      this.http
        .get(`http://${address}/cm`, {
          params: {
            cmnd: command,
          },
        })
        .pipe(
          map(() => true),
          catchError(() => of(false)),
        ),
    );

    if (!success) {
      throw `Failed to send command to ${address}: ${command}`;
    }
  }

  async setupRelaisWebhook(address: string, deviceId: string, callbackUrl: string): Promise<void> {
    const offRoute = `/${Routes.devices}/${deviceId}/${Routes.state}/${commonStateIds.off}`;
    const onRoute = `/${Routes.devices}/${deviceId}/${Routes.state}/${commonStateIds.on}`;

    return await this.sendCommand(
      address,
      `Backlog Rule1 ON Power1#State=0 DO WebSend [${callbackUrl}] ${offRoute} ENDON ON Power1#State=1 DO WebSend [${callbackUrl}] ${onRoute} ENDON; Rule1 1`,
    );
  }
}
