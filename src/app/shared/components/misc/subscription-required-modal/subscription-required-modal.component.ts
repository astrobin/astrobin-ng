import { Component, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SimplifiedSubscriptionName } from "@core/types/subscription-name.type";

@Component({
  selector: "astrobin-subscription-required-modal",
  templateUrl: "./subscription-required-modal.component.html",
  styleUrls: ["./subscription-required-modal.component.scss"]
})
export class SubscriptionRequiredModalComponent extends BaseComponentDirective {
  SimplifiedSubscriptionName = SimplifiedSubscriptionName;

  @Input()
  minimumSubscription: SimplifiedSubscriptionName = SimplifiedSubscriptionName.ASTROBIN_LITE_2020;

  constructor(public readonly store$: Store<MainState>, public readonly modal: NgbActiveModal) {
    super(store$);
  }
}
