import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions, ofType } from "@ngrx/effects";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map, takeUntil, tap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentActionTypes } from "@features/equipment/store/equipment.actions";

@Component({
  selector: "astrobin-equipment-item-type-nav",
  templateUrl: "./item-type-nav.component.html",
  styleUrls: ["./item-type-nav.component.scss"]
})
export class ItemTypeNavComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  excludeTypes: EquipmentItemType[] = [];

  @Input()
  showCounts = true;

  @Input()
  showSubNavigation = true;

  @Input()
  routingBasePath = "/equipment/explorer";

  @Input()
  cameraCount: Observable<number | null> = null;
  camerasPendingReviewCount: Observable<number | null> = null;
  camerasPendingEditCount: Observable<number | null> = null;

  @Input()
  sensorCount: Observable<number | null> = null;
  sensorsPendingReviewCount: Observable<number | null> = null;
  sensorsPendingEditCount: Observable<number | null> = null;

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

  @Input()
  softwareCount: Observable<number | null> = null;
  softwarePendingReviewCount: Observable<number | null> = null;
  softwarePendingEditCount: Observable<number | null> = null;

  types: {
    label: string;
    value: EquipmentItemType;
    count: Observable<number | null>;
    providedCount: Observable<number | null>;
    pendingReviewCount: Observable<number | null>;
    pendingEditCount: Observable<number | null>;
    disabled?: boolean;
  }[];

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
  }

  ngOnInit() {
    this._setActiveSubNav(this.activatedRoute.snapshot.url.join("/"));
    this._initRouterEvents();
    this._initActionListeners();
    this._initTypes();
    this._loadCounts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.types) {
      return;
    }

    // TODO: complete

    if (changes.cameraCount) {
      this.types.find(type => type.value === EquipmentItemType.CAMERA).count = changes.cameraCount.currentValue;
    }

    if (changes.sensorCount) {
      this.types.find(type => type.value === EquipmentItemType.SENSOR).count = changes.sensorCount.currentValue;
    }

    if (changes.telescopeCount) {
      this.types.find(type => type.value === EquipmentItemType.TELESCOPE).count = changes.telescopeCount.currentValue;
    }

    if (changes.mountCount) {
      this.types.find(type => type.value === EquipmentItemType.MOUNT).count = changes.mountCount.currentValue;
    }
  }

  _setActiveSubNav(url: string) {
    if (url.indexOf("a-z-explorer") > -1) {
      this.activeSubNav = "a-z-explorer";
    } else if (url.indexOf("pending-review-explorer") > -1) {
      this.activeSubNav = "pending-review-explorer";
    } else if (url.indexOf("pending-edit-explorer") > -1) {
      this.activeSubNav = "pending-edit-explorer";
    }
  }

  _initRouterEvents() {
    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
        this._setActiveSubNav(event.urlAfterRedirects);
      }
    });
  }

  _initActionListeners() {
    this.actions$
      .pipe(
        ofType(
          ...[
            // TODO: complete all CREATE_*_SUCCESS types.
            EquipmentActionTypes.CREATE_CAMERA_SUCCESS,
            EquipmentActionTypes.CREATE_SENSOR_SUCCESS,
            EquipmentActionTypes.CREATE_TELESCOPE_SUCCESS,
            EquipmentActionTypes.CREATE_MOUNT_SUCCESS,
            // TODO: complete all CREATE_*_EDIT_PROPOSAL_SUCCESS types.
            EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS,

            EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS,
            EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS,
            EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS
          ]
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this._loadCounts();
      });
  }

  _initTypes() {
    this.types = [
      {
        label: this.translateService.instant("Cameras"),
        value: EquipmentItemType.CAMERA,
        count: this.cameraCount,
        providedCount: this.cameraCount,
        pendingReviewCount: this.camerasPendingReviewCount,
        pendingEditCount: this.camerasPendingEditCount
      },
      {
        label: this.translateService.instant("Sensors"),
        value: EquipmentItemType.SENSOR,
        count: this.sensorCount,
        providedCount: this.sensorCount,
        pendingReviewCount: this.sensorsPendingReviewCount,
        pendingEditCount: this.sensorsPendingEditCount
      },
      {
        label: this.translateService.instant("Telescopes & lenses"),
        value: EquipmentItemType.TELESCOPE,
        count: this.telescopeCount,
        providedCount: this.telescopeCount,
        pendingReviewCount: this.telescopesPendingReviewCount,
        pendingEditCount: this.telescopesPendingEditCount
      },
      {
        label: this.translateService.instant("Mounts"),
        value: EquipmentItemType.MOUNT,
        count: this.mountCount,
        providedCount: this.mountCount,
        pendingReviewCount: this.mountsPendingReviewCount,
        pendingEditCount: this.mountsPendingEditCount
      },
      {
        label: this.translateService.instant("Filters"),
        value: EquipmentItemType.FILTER,
        count: this.filterCount,
        providedCount: this.filterCount,
        pendingReviewCount: this.filtersPendingReviewCount,
        pendingEditCount: this.filtersPendingEditCount,
        disabled: true
      },
      {
        label: this.translateService.instant("Accessories"),
        value: EquipmentItemType.ACCESSORY,
        count: this.accessoryCount,
        providedCount: this.accessoryCount,
        pendingReviewCount: this.accessoriesPendingReviewCount,
        pendingEditCount: this.accessoriesPendingEditCount,
        disabled: true
      },
      {
        label: this.translateService.instant("Software"),
        value: EquipmentItemType.SOFTWARE,
        count: this.softwareCount,
        providedCount: this.softwareCount,
        pendingReviewCount: this.softwarePendingReviewCount,
        pendingEditCount: this.softwarePendingEditCount,
        disabled: true
      }
    ].filter(type => this.excludeTypes.indexOf(type.value) === -1);
  }

  _loadCounts() {
    if (!this.showCounts) {
      return;
    }

    for (const type of this.types) {
      // TODO: complete (remove when all other types have API).
      if (
        [
          EquipmentItemType.CAMERA,
          EquipmentItemType.SENSOR,
          EquipmentItemType.TELESCOPE,
          EquipmentItemType.MOUNT
        ].indexOf(type.value) === -1
      ) {
        continue;
      }

      if (type.providedCount) {
        // Don't override provided count.
        continue;
      }

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
}
