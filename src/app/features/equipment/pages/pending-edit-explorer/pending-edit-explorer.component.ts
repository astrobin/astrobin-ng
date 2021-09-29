import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Actions } from "@ngrx/effects";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { take, tap } from "rxjs/operators";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { PendingExplorerBaseComponent } from "@features/equipment/pages/explorer-base/pending-explorer-base.component";

@Component({
  selector: "astrobin-equipment-pending-edit-explorer",
  templateUrl: "../explorer-base/pending-explorer-base.component.html",
  styleUrls: ["../explorer-base/pending-explorer-base.component.scss"]
})
export class PendingEditExplorerComponent extends PendingExplorerBaseComponent implements OnInit {
  title = this.translateService.instant("Equipment pending edit");

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly router: Router
  ) {
    super(store$, actions$, activatedRoute, router);
  }

  ngOnInit() {
    super.ngOnInit();

    this.titleService.setTitle(this.title);

    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment")
          },
          {
            label: this.translateService.instant("Pending edit")
          }
        ]
      })
    );

    this.items$ = this.equipmentApiService.getAllEquipmentItemsPendingEdit(this._activeType).pipe(
      tap(response => {
        const uniqueBrands: BrandInterface["id"][] = [];
        for (const item of response.results) {
          if (uniqueBrands.indexOf(item.brand) === -1) {
            uniqueBrands.push(item.brand);
          }
        }
        uniqueBrands.forEach(id => this.store$.dispatch(new LoadBrand({ id })));
      })
    );
  }

  pageChange(page: number): void {
    this.page = page;
    this.items$ = this.equipmentApiService.getAllEquipmentItemsPendingEdit(this._activeType, page);
  }
}
