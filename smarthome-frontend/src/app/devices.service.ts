import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Routes } from "shared/routes";
import { DeviceDto } from "shared/device";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DevicesService {
  constructor(private readonly http: HttpClient) {}
  getDevices(): Observable<DeviceDto[]> {
    return this.http.get<DeviceDto[]>(Routes.devices);
  }
}
