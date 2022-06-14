import { Component } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

@Component({
  selector: "astrobin-data-does-not-update-in-realtime",
  templateUrl: "./data-does-not-update-in-real-time.component.html",
  styleUrls: ["./data-does-not-update-in-real-time.component.scss"]
})
export class DataDoesNotUpdateInRealTimeComponent extends BaseComponentDirective {
  constructor(public readonly store$: Store<State>) {
    super(store$);
  }
}
