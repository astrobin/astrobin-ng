import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { EquipmentItemType } from "@features/equipment/interfaces/equipment-item-base.interface";
import { map, takeUntil } from "rxjs/operators";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";

@Component({
  selector: "astrobin-equipment-explorer",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorer.component.scss"]
})
export class ExplorerComponent extends BaseComponentDirective implements OnInit {
  EquipmentItemType = EquipmentItemType;

  title = this.translateService.instant("Equipment explorer");

  cameraCount$ = this.equipmentApiService.getAllEquipmentItems(EquipmentItemType.CAMERA).pipe(
    takeUntil(this.destroyed$),
    map(response => response.count)
  );

  private _activeType: string;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);

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

    this._activeType = this.activatedRoute.snapshot.paramMap.get("itemType");

    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this._activeType = this.activatedRoute.snapshot.paramMap.get("itemType").toUpperCase();
      }
    });
  }

  get activeType(): EquipmentItemType {
    return EquipmentItemType[this._activeType.toUpperCase()];
  }
}
