import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

@Component({
  selector: "astrobin-hr",
  templateUrl: "./hr.component.html",
  styleUrls: ["./hr.component.scss"]
})
export class HrComponent extends BaseComponentDirective {
  @Input()
  text: string;

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }
}
