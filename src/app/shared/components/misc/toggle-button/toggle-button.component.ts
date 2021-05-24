import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-toggle-button",
  templateUrl: "./toggle-button.component.html",
  styleUrls: ["./toggle-button.component.scss"]
})
export class ToggleButtonComponent extends BaseComponentDirective {
  model: boolean;

  @Input()
  value: boolean;

  @Output()
  toggle = new EventEmitter<boolean>();

  constructor() {
    super();
  }
}
