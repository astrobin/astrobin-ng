import { Component } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-data-does-not-update-in-real-time",
  templateUrl: "./data-does-not-update-in-real-time.component.html",
  styleUrls: ["./data-does-not-update-in-real-time.component.scss"]
})
export class DataDoesNotUpdateInRealTimeComponent extends BaseComponentDirective {
  constructor(public readonly store$: Store<MainState>) {
    super(store$);
  }
}
