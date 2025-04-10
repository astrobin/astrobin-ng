import { OnInit, Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { CookieService } from "ngx-cookie";
import { Observable } from "rxjs";
import { filter, map, takeUntil } from "rxjs/operators";

export enum ConfirmDismissResult {
  CANCEL,
  CONFIRM
}

export const DISMISSAL_NOTICE_COOKIE = "astrobin-iotd-do-not-show-dismissal-notice";

@Component({
  selector: "astrobin-confirm-dismiss-modal",
  templateUrl: "./confirm-dismiss-modal.component.html"
})
export class ConfirmDismissModalComponent extends BaseComponentDirective implements OnInit {
  ConfirmDismissResult = ConfirmDismissResult;

  maxDismissals$: Observable<number> = this.store$.select(selectBackendConfig).pipe(
    filter(backendConfig => !!backendConfig),
    map(backendConfig => backendConfig.IOTD_MAX_DISMISSALS)
  );

  form: FormGroup = new FormGroup({});
  model: {
    dontRemindMeForAMonth: boolean;
  } = {
    dontRemindMeForAMonth: false
  };
  fields: FormlyFieldConfig[];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly cookieService: CookieService
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

  ngOnInit() {
    super.ngOnInit();

    this.fields = [
      {
        key: "dontRemindMeForAMonth",
        type: "checkbox",
        id: "dont-remind-me-for-a-month-field",
        props: {
          label: this.translateService.instant("Don't remind me for a month")
        },
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
              this.cookieService.put(DISMISSAL_NOTICE_COOKIE, value ? "1" : "0", {
                path: "/",
                expires: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
              });
            });
          }
        }
      }
    ];
  }
}
