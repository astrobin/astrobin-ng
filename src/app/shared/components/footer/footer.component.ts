import { Component } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { environment } from "@env/environment";

@Component({
  selector: "astrobin-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"]
})
export class FooterComponent extends BaseComponentDirective {
  get currentYear(): number {
    return new Date().getFullYear();
  }

  get version(): string {
    return environment.buildVersion;
  }
}
