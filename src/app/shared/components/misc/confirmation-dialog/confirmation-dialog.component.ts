import { Component, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@core/services/loading.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-confirmation-dialog",
  templateUrl: "./confirmation-dialog.component.html",
  styleUrls: ["./confirmation-dialog.component.scss"]
})
export class ConfirmationDialogComponent extends BaseComponentDirective {
  @Input()
  title: string;

  @Input()
  message: string;

  @Input()
  showMessage = true;

  @Input()
  showAreYouSure = true;

  @Input()
  cancelLabel = this.translateService.instant("Cancel");

  @Input()
  confirmLabel = this.translateService.instant("Yes, continue");

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }
}
