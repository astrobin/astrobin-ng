import { Component, Input } from "@angular/core";

@Component({
  selector: "astrobin-private-information",
  templateUrl: "./private-information.component.html",
  styleUrls: ["./private-information.component.scss"]
})
export class PrivateInformationComponent {
  @Input()
  withAlert = true;

  @Input()
  withInfoSign = true;
}
