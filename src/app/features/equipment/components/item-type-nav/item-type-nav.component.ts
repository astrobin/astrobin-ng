import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map, takeUntil, tap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType } from "@features/equipment/interfaces/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { LoadingService } from "@shared/services/loading.service";

@Component({
  selector: "astrobin-equipment-item-type-nav",
  templateUrl: "./item-type-nav.component.html",
  styleUrls: ["./item-type-nav.component.scss"]
})
export class ItemTypeNavComponent extends BaseComponentDirective implements OnInit {
  @Input()
  cameraCount: Observable<number | null> = null;
  camerasPendingReviewCount: Observable<number | null> = null;
  camerasPendingEditCount: Observable<number | null> = null;

  @Input()
  telescopeCount: Observable<number | null> = null;
  telescopesPendingReviewCount: Observable<number | null> = null;
  telescopesPendingEditCount: Observable<number | null> = null;

  @Input()
  mountCount: Observable<number | null> = null;
  mountsPendingReviewCount: Observable<number | null> = null;
  mountsPendingEditCount: Observable<number | null> = null;

  @Input()
  filterCount: Observable<number | null> = null;
  filtersPendingReviewCount: Observable<number | null> = null;
  filtersPendingEditCount: Observable<number | null> = null;

  @Input()
  accessoryCount: Observable<number | null> = null;
  accessoriesPendingReviewCount: Observable<number | null> = null;
  accessoriesPendingEditCount: Observable<number | null> = null;

  @Input() softwareCount: Observable<number | null> = null;
  softwarePendingReviewCount: Observable<number | null> = null;
  softwarePendingEditCount: Observable<number | null> = null;

  types: {
    label: string;
    value: EquipmentItemType;
    count: Observable<number | null>;
    pendingReviewCount: Observable<number | null>;
    pendingEditCount: Observable<number | null>;
    disabled?: boolean;
  }[] = [
    {
      label: this.translateService.instant("Cameras"),
      value: EquipmentItemType.CAMERA,
      count: this.cameraCount,
      pendingReviewCount: this.camerasPendingReviewCount,
      pendingEditCount: this.camerasPendingEditCount
    },
    {
      label: this.translateService.instant("Telescopes"),
      value: EquipmentItemType.TELESCOPE,
      count: this.telescopeCount,
      pendingReviewCount: this.telescopesPendingReviewCount,
      pendingEditCount: this.telescopesPendingEditCount,
      disabled: true
    },
    {
      label: this.translateService.instant("Mounts"),
      value: EquipmentItemType.MOUNT,
      count: this.mountCount,
      pendingReviewCount: this.mountsPendingReviewCount,
      pendingEditCount: this.mountsPendingEditCount,
      disabled: true
    },
    {
      label: this.translateService.instant("Filters"),
      value: EquipmentItemType.FILTER,
      count: this.filterCount,
      pendingReviewCount: this.filtersPendingReviewCount,
      pendingEditCount: this.filtersPendingEditCount,
      disabled: true
    },
    {
      label: this.translateService.instant("Accessories"),
      value: EquipmentItemType.ACCESSORY,
      count: this.accessoryCount,
      pendingReviewCount: this.accessoriesPendingReviewCount,
      pendingEditCount: this.accessoriesPendingEditCount,
      disabled: true
    },
    {
      label: this.translateService.instant("Software"),
      value: EquipmentItemType.SOFTWARE,
      count: this.softwareCount,
      pendingReviewCount: this.softwarePendingReviewCount,
      pendingEditCount: this.softwarePendingEditCount,
      disabled: true
    }
  ];

  activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
  activeSubNav = "";

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly translateService: TranslateService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);

    for (const type of this.types) {
      type.count = this.equipmentApiService.getAllEquipmentItems(type.value).pipe(
        takeUntil(this.destroyed$),
        catchError(() => of({ count: 0 })),
        map(response => response.count),
        tap(() => this.loadingService.setLoading(false))
      );

      type.pendingReviewCount = this.equipmentApiService.getAllEquipmentItemsPendingReview(type.value).pipe(
        takeUntil(this.destroyed$),
        catchError(() => of({ count: 0 })),
        map(response => response.count),
        tap(() => this.loadingService.setLoading(false))
      );

      type.pendingEditCount = this.equipmentApiService.getAllEquipmentItemsPendingEdit(type.value).pipe(
        takeUntil(this.destroyed$),
        catchError(() => of({ count: 0 })),
        map(response => response.count),
        tap(() => this.loadingService.setLoading(false))
      );
    }
  }

  ngOnInit(): void {
    this._setActiveSubNav(this.activatedRoute.snapshot.url.join("/"));

    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
        this._setActiveSubNav(event.urlAfterRedirects);
      }
    });
  }

  _setActiveSubNav(url: string) {
    if (url.indexOf("pending-review-explorer") > -1) {
      this.activeSubNav = "pending-review-explorer";
    } else if (url.indexOf("pending-edit-explorer") > -1) {
      this.activeSubNav = "pending-edit-explorer";
    }
  }
}
