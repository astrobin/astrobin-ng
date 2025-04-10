import { Component } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { ClassicRoutesService } from "@core/services/classic-routes.service";
import type { LoadingService } from "@core/services/loading.service";
import type { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-remove-ads-dialog",
  templateUrl: "./remove-ads-dialog.component.html",
  styleUrls: ["./remove-ads-dialog.component.scss"]
})
export class RemoveAdsDialogComponent extends BaseComponentDirective {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly loadingService: LoadingService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }
}
