import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { UserInterface } from "@shared/interfaces/user.interface";

@Component({
  selector: "astrobin-marketplace-feedback-widget",
  templateUrl: "./marketplace-feedback-widget.component.html",
  styleUrls: ["./marketplace-feedback-widget.component.scss"]
})
export class MarketplaceFeedbackWidgetComponent extends BaseComponentDirective implements OnInit {
  @Input()
  user: UserInterface;

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
