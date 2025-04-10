import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { LoadingService } from "@core/services/loading.service";
import type { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-confirmation-dialog",
  templateUrl: "./information-dialog.component.html",
  styleUrls: ["./information-dialog.component.scss"]
})
export class InformationDialogComponent extends BaseComponentDirective {
  @Input()
  message: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }
}
