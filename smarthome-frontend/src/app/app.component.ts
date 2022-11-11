import { Component } from "@angular/core";
import { DevicesService } from "./devices.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "smarthome-frontend";

  constructor(private readonly devices: DevicesService) {}

  ngOnInit() {
    ("");
  }
}
