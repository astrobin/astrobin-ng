import { Component } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-loading-indicator",
  templateUrl: "./loading-indicator.component.html"
})
export class LoadingIndicatorComponent extends BaseComponentDirective {}
