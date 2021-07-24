import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Theme, ThemeService } from "@shared/services/theme.service";

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

  constructor(public readonly themeService: ThemeService) {
    super();
  }

  get color(): any {
    const highContrast = this.themeService.currentTheme() === Theme.HIGH_CONTRAST;
    return {
      checked: highContrast ? "#888" : "#cc4b2e",
      unchecked: highContrast ? "#000" : "#111"
    };
  }

  get switchColor(): any {
    const highContrast = this.themeService.currentTheme() === Theme.HIGH_CONTRAST;
    return {
      checked: "#fff",
      unchecked: highContrast ? "#888" : "#666"
    };
  }
}
