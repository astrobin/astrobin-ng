import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { Actions } from "@ngrx/effects";
import { EquipmentItemEditorMode } from "@features/equipment/components/editors/base-item-editor/base-item-editor.component";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";

@Component({
  selector: "astrobin-equipment-explorer-page",
  templateUrl: "./explorer-page.component.html",
  styleUrls: ["./explorer-page.component.scss"]
})
export class ExplorerPageComponent extends ExplorerBaseComponent implements OnInit {
  EquipmentItemType = EquipmentItemType;
  EquipmentItemEditorMode = EquipmentItemEditorMode;

  title = this.translateService.instant("Equipment explorer");

  activeId: EquipmentItemBaseInterface["id"];

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router
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
            label: this.translateService.instant("Explorer")
          }
        ]
      })
    );
  }

  _setActiveId() {
    this.activeId = parseInt(this.activatedRoute.snapshot.paramMap.get("itemId"), 10);
  }
}
