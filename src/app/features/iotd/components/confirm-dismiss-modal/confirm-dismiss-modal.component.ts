import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";

export enum ConfirmDismissResult {
  CANCEL,
  CONFIRM
}

@Component({
  selector: "astrobin-confirm-dismiss-modal",
  templateUrl: "./confirm-dismiss-modal.component.html"
})
export class ConfirmDismissModalComponent extends BaseComponentDirective {
  ConfirmDismissResult = ConfirmDismissResult;

  constructor(public readonly store$: Store<State>, public readonly modal: NgbActiveModal) {
    super(store$);
  }
}
