import { Component } from "@angular/core";
import { Device } from "shared";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "smarthome-frontend";

  ngOnInit() {
    new Device("");
  }
}
