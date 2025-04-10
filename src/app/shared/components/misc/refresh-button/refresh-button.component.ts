import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { LoadingService } from "@core/services/loading.service";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-refresh-button",
  templateUrl: "./refresh-button.component.html",
  styleUrls: ["./refresh-button.component.scss"]
})
export class RefreshButtonComponent extends BaseComponentDirective {
  @Input() loading: boolean;

  constructor(public readonly store$: Store<MainState>, public readonly loadingService: LoadingService) {
    super(store$);
  }
}
