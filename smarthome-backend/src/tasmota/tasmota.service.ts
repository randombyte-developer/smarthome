import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { catchError, lastValueFrom, map, of } from "rxjs";
import { deviceDtoSchema } from "shared";

@Injectable()
export class TasmotaService {
  constructor(private readonly http: HttpService) {}

  sendPowerCommand(address: string, state: string): Promise<boolean> {
    return this.sendCommand(address, `Power1 ${state}`);
  }

  sendCommand(address: string, command: string): Promise<boolean> {
    return lastValueFrom(
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
  }

  setupRelaisWebhook(address: string, deviceId: string, callbackUrl: string): void {
    this.sendCommand(
      address,
      `
      Backlog Rule1 
      ON Power1#State=0 DO WebSend [${callbackUrl}] /relais/${deviceId}/state/off ENDON 
      ON Power1#State=1 DO WebSend [${callbackUrl}] /relais/${deviceId}/state/on ENDON; 
      Rule1 1
      `,
    );
  }
}
