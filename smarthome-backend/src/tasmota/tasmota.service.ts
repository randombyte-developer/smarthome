import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { catchError, lastValueFrom, map, of } from "rxjs";

@Injectable()
export class TasmotaService {
  constructor(private readonly http: HttpService) {}

  sendPowerCommand(address: string, state: string): Promise<boolean> {
    return this.sendCommand(`http://${address}/cm`, `Power1 ${state}`);
  }

  sendCommand(url: string, command: string): Promise<boolean> {
    return lastValueFrom(
      this.http
        .get(url, {
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
}
