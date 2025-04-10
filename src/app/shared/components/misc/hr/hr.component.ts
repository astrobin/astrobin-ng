import { Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-hr",
  templateUrl: "./hr.component.html",
  styleUrls: ["./hr.component.scss"]
})
export class HrComponent extends BaseComponentDirective {
  @Input()
  text: string;

  constructor(public readonly store$: Store<MainState>) {
    super(store$);
  }
}
