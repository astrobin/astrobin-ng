import { Component, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
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
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }
}
