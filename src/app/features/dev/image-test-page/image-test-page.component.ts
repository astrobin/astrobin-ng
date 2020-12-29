import { Component } from "@angular/core";
import { ImageAlias } from "@shared/enums/image-alias.enum";

@Component({
  selector: "astrobin-image-test-page",
  templateUrl: "./image-test-page.component.html",
  styleUrls: ["./image-test-page.component.scss"]
})
export class ImageTestPageComponent {
  readonly id = 1;
  readonly alias = ImageAlias.REGULAR;
}
