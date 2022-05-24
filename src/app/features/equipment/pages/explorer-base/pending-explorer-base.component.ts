import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { ActivatedRoute, Router } from "@angular/router";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-equipment-pending-explorer-base",
  templateUrl: "./pending-explorer-base.component.html"
})
export class PendingExplorerBaseComponent extends ExplorerBaseComponent {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$, actions$, activatedRoute, router, windowRefService);
  }
}
