import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { ActivatedRoute, Router } from "@angular/router";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";

@Component({
  selector: "astrobin-migration-explorer",
  templateUrl: "./migration-explorer.component.html",
  styleUrls: ["./migration-explorer.component.scss"]
})
export class MigrationExplorerComponent extends ExplorerBaseComponent implements OnInit {
  title = "Migration explorer";

  activeId: EquipmentItemBaseInterface["id"];

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService
  ) {
    super(store$, actions$, activatedRoute, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setTitle();
    this._setBreadcrumb();
    this._setActiveId();
  }

  _setTitle() {
    this.titleService.setTitle(this.title);
  }

  _setBreadcrumb() {
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment")
          },
          {
            label: this.title
          }
        ]
      })
    );
  }

  _setActiveId() {
    this.activeId = parseInt(this.activatedRoute.snapshot.paramMap.get("itemId"), 10);
  }
}
