import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Theme, ThemeService } from "@shared/services/theme.service";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";

@Component({
  selector: "astrobin-toggle-button",
  templateUrl: "./toggle-button.component.html",
  styleUrls: ["./toggle-button.component.scss"]
})
export class ToggleButtonComponent extends BaseComponentDirective implements OnInit {
  model: boolean;

  @Input()
  value: boolean;

  @Input()
  label: string;

  @Input()
  labelClassName: string;

  @Input()
  disabled = false;

  @Output()
  toggle = new EventEmitter<boolean>();

  color: { checked: string, unchecked: string };
  switchColor: { checked: string, unchecked: string };
  uniqueId = Math.random().toString(36).slice(2, 11);

  constructor(public readonly store$: Store<MainState>, public readonly themeService: ThemeService) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const highContrast = this.themeService.preferredTheme() === Theme.HIGH_CONTRAST;
    this.color = {
      checked: highContrast ? "#888" : "#cc4b2e",
      unchecked: highContrast ? "#000" : "#111"
    };

    this.switchColor = {
      checked: "#fff",
      unchecked: highContrast ? "#888" : "#666"
    };
  }
}
