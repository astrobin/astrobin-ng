import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import { SimplifiedSubscriptionName } from "@core/types/subscription-name.type";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

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
