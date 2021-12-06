import { Component } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Observable } from "rxjs";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { filter, map } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";

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
  maxDismissals$: Observable<number> = this.store$.select(selectBackendConfig).pipe(
    filter(backendConfig => !!backendConfig),
    map(backendConfig => backendConfig.IOTD_MAX_DISMISSALS)
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  get maxDismissalsMessage$(): Observable<string> {
    return this.maxDismissals$.pipe(
      map(maxDismissals => {
        return this.translateService.instant(
          "When an image is dismissed by {{0}} members of the IOTD/TP staff, it's automatically removed from " +
            "all queues. Please only perform this action if you want to vote against this image advancing in the " +
            "process.",
          {
            "0": maxDismissals
          }
        );
      })
    );
  }
}
