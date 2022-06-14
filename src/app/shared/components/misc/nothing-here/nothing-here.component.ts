import { Component, Input } from "@angular/core";

@Component({
  selector: "astrobin-nothing-here",
  templateUrl: "./nothing-here.component.html",
  styleUrls: ["./nothing-here.component.scss"]
})
export class NothingHereComponent {
  @Input()
  withAlert = true;

  @Input()
  withInfoSign = true;
}
