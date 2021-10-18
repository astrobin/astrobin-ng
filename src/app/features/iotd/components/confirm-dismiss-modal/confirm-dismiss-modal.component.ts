import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { switchMap } from "rxjs/operators";

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

  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly translate: TranslateService
  ) {
    super(store$);
  }

  get dismissalWarning(): Observable<string> {
    return this.store$.select(selectBackendConfig).pipe(
      switchMap(backendConfig => {
        return this.translate.stream(
          "When an image is dismissed more than {{0}} times, it disappears from everybody's queue. Only dismiss " +
            "an image when you feel <strong>very confident</strong> that it should not advance to the next step of " +
            "the selection process!",
          {
            0: backendConfig.IOTD_MAX_DISMISSALS
          }
        );
      })
    );
  }
}
