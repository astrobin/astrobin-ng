import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Theme, ThemeService } from "@shared/services/theme.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

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

  constructor(public readonly store$: Store<State>, public readonly themeService: ThemeService) {
    super(store$);
  }

  get color(): any {
    const highContrast = this.themeService.preferredTheme() === Theme.HIGH_CONTRAST;
    return {
      checked: highContrast ? "#888" : "#cc4b2e",
      unchecked: highContrast ? "#000" : "#111"
    };
  }

  get switchColor(): any {
    const highContrast = this.themeService.preferredTheme() === Theme.HIGH_CONTRAST;
    return {
      checked: "#fff",
      unchecked: highContrast ? "#888" : "#666"
    };
  }
}
