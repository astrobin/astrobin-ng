import { isPlatformBrowser } from "@angular/common";
import type { AfterViewInit, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { Component, Inject, Input, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { EquipmentApiService, EquipmentItemsSortOrder } from "@features/equipment/services/equipment-api.service";
import { EquipmentActionTypes, GetAllBrands } from "@features/equipment/store/equipment.actions";
import { selectEquipment, selectEquipmentContributors } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Constants } from "@shared/constants";
import type { ActiveToast } from "ngx-toastr";
import { fromEvent, Observable, of } from "rxjs";
import { catchError, debounceTime, map, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-equipment-item-type-nav",
  templateUrl: "./item-type-nav.component.html",
  styleUrls: ["./item-type-nav.component.scss"]
})
export class ItemTypeNavComponent
  extends BaseComponentDirective
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input()
  excludeTypes: EquipmentItemType[] = [];

  @Input()
  showCounts = true;

  @Input()
  showSubNavigation = true;

  @Input()
  routingBasePath = "/equipment/explorer";

  @Input()
  showBrands = true;

  @Input()
  showContributors = true;

  @Input()
  cameraCount: Observable<number | null> = null;
  camerasPendingReviewCount: Observable<number | null> = null;
  camerasPendingEditCount: Observable<number | null> = null;
  camerasFollowedCount: Observable<number | null> = null;

  @Input()
  sensorCount: Observable<number | null> = null;
  sensorsPendingReviewCount: Observable<number | null> = null;
  sensorsPendingEditCount: Observable<number | null> = null;
  sensorsFollowedCount: Observable<number | null> = null;

  @Input()
  telescopeCount: Observable<number | null> = null;
  telescopesPendingReviewCount: Observable<number | null> = null;
  telescopesPendingEditCount: Observable<number | null> = null;
  telescopesFollowedCount: Observable<number | null> = null;

  @Input()
  mountCount: Observable<number | null> = null;
  mountsPendingReviewCount: Observable<number | null> = null;
  mountsPendingEditCount: Observable<number | null> = null;
  mountsFollowedCount: Observable<number | null> = null;

  @Input()
  filterCount: Observable<number | null> = null;
  filtersPendingReviewCount: Observable<number | null> = null;
  filtersPendingEditCount: Observable<number | null> = null;
  filtersFollowedCount: Observable<number | null> = null;

  @Input()
  accessoryCount: Observable<number | null> = null;
  accessoriesPendingReviewCount: Observable<number | null> = null;
  accessoriesPendingEditCount: Observable<number | null> = null;
  accessoriesFollowedCount: Observable<number | null> = null;

  @Input()
  softwareCount: Observable<number | null> = null;
  softwarePendingReviewCount: Observable<number | null> = null;
  softwarePendingEditCount: Observable<number | null> = null;
  softwareFollowedCount: Observable<number | null> = null;

  @Input()
  activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");

  brandCount$: Observable<number | null> = this.store$.select(selectEquipment).pipe(map(state => state.brandsCount));
  contributorCount$: Observable<number | null> = this.store$
    .select(selectEquipmentContributors)
    .pipe(map(contributors => contributors.length));

  types: {
    label: string;
    value: EquipmentItemType;
    count: Observable<number | null>;
    providedCount: Observable<number | null>;
    pendingReviewCount: Observable<number | null>;
    pendingEditCount: Observable<number | null>;
    followedCount: Observable<number | null>;
    disabled?: boolean;
  }[];

  activeSubNav = "";
  reviewPendingEditNotification: ActiveToast<any>;
  isSmallDevice: boolean;
  uncollapsedTypes: string[] = [];
  defaultAvatarUrl = Constants.DEFAULT_AVATAR;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly translateService: TranslateService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    @Inject(PLATFORM_ID) public readonly platformId: object
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this._initRouterEvents();
    this._setActiveSubNav(this.activatedRoute.snapshot?.url.join("/"));
    this._initActionListeners();
    this._initTypes();
    this._loadCounts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.types) {
      return;
    }

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

    if (changes.filterCount) {
      this.types.find(type => type.value === EquipmentItemType.FILTER).count = changes.filterCount.currentValue;
    }

    if (changes.accessoryCount) {
      this.types.find(type => type.value === EquipmentItemType.ACCESSORY).count = changes.accessoryCount.currentValue;
    }

    if (changes.softwareCount) {
      this.types.find(type => type.value === EquipmentItemType.SOFTWARE).count = changes.softwareCount.currentValue;
    }
  }

  ngAfterViewInit() {
    const _setIsSmallDevice = () => {
      this.isSmallDevice = this.windowRefService.nativeWindow.window.innerWidth < 768;
    };

    if (isPlatformBrowser(this.platformId)) {
      _setIsSmallDevice();

      fromEvent(this.windowRefService.nativeWindow, "resize")
        .pipe(debounceTime(100), takeUntil(this.destroyed$))
        .subscribe(() => {
          _setIsSmallDevice();
        });
    }
  }

  ngOnDestroy() {
    if (!!this.reviewPendingEditNotification) {
      this.popNotificationsService.clear(this.reviewPendingEditNotification.toastId);
    }

    super.ngOnDestroy();
  }

  toggleCollapseType(event: MouseEvent, type: EquipmentItemType) {
    event.preventDefault();
    event.stopPropagation();

    const index = this.uncollapsedTypes.indexOf(type);
    if (index > -1) {
      this.uncollapsedTypes.splice(index, 1);
    } else {
      this.uncollapsedTypes.push(type);
    }
  }

  _setActiveSubNav(url: string) {
    if (url.indexOf("a-z-explorer") > -1) {
      this.activeSubNav = "a-z-explorer";
    } else if (url.indexOf("pending-review-explorer") > -1) {
      this.activeSubNav = "pending-review-explorer";
    } else if (url.indexOf("pending-edit-explorer") > -1) {
      this.activeSubNav = "pending-edit-explorer";
    } else if (url.indexOf("followed-explorer") > -1) {
      this.activeSubNav = "followed-explorer";
    }
  }

  _initRouterEvents() {
    this.router.events?.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");
        this._setActiveSubNav(event.urlAfterRedirects);
      }
    });
  }

  _initActionListeners() {
    this.actions$
      .pipe(
        ofType(
          ...[
            EquipmentActionTypes.CREATE_CAMERA_SUCCESS,
            EquipmentActionTypes.CREATE_SENSOR_SUCCESS,
            EquipmentActionTypes.CREATE_TELESCOPE_SUCCESS,
            EquipmentActionTypes.CREATE_MOUNT_SUCCESS,
            EquipmentActionTypes.CREATE_FILTER_SUCCESS,
            EquipmentActionTypes.CREATE_ACCESSORY_SUCCESS,
            EquipmentActionTypes.CREATE_SOFTWARE_SUCCESS,

            EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS,
            EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL_SUCCESS,

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
        pendingEditCount: this.camerasPendingEditCount,
        followedCount: this.camerasFollowedCount
      },
      {
        label: this.translateService.instant("Sensors"),
        value: EquipmentItemType.SENSOR,
        count: this.sensorCount,
        providedCount: this.sensorCount,
        pendingReviewCount: this.sensorsPendingReviewCount,
        pendingEditCount: this.sensorsPendingEditCount,
        followedCount: this.sensorsFollowedCount
      },
      {
        label: this.translateService.instant("Telescopes & lenses"),
        value: EquipmentItemType.TELESCOPE,
        count: this.telescopeCount,
        providedCount: this.telescopeCount,
        pendingReviewCount: this.telescopesPendingReviewCount,
        pendingEditCount: this.telescopesPendingEditCount,
        followedCount: this.telescopesFollowedCount
      },
      {
        label: this.translateService.instant("Mounts"),
        value: EquipmentItemType.MOUNT,
        count: this.mountCount,
        providedCount: this.mountCount,
        pendingReviewCount: this.mountsPendingReviewCount,
        pendingEditCount: this.mountsPendingEditCount,
        followedCount: this.mountsFollowedCount
      },
      {
        label: this.translateService.instant("Filters"),
        value: EquipmentItemType.FILTER,
        count: this.filterCount,
        providedCount: this.filterCount,
        pendingReviewCount: this.filtersPendingReviewCount,
        pendingEditCount: this.filtersPendingEditCount,
        followedCount: this.filtersFollowedCount
      },
      {
        label: this.translateService.instant("Accessories"),
        value: EquipmentItemType.ACCESSORY,
        count: this.accessoryCount,
        providedCount: this.accessoryCount,
        pendingReviewCount: this.accessoriesPendingReviewCount,
        pendingEditCount: this.accessoriesPendingEditCount,
        followedCount: this.accessoriesFollowedCount
      },
      {
        label: this.translateService.instant("Software"),
        value: EquipmentItemType.SOFTWARE,
        count: this.softwareCount,
        providedCount: this.softwareCount,
        pendingReviewCount: this.softwarePendingReviewCount,
        pendingEditCount: this.softwarePendingEditCount,
        followedCount: this.softwareFollowedCount
      }
    ].filter(type => this.excludeTypes.indexOf(type.value) === -1);
  }

  _loadCounts() {
    if (!this.showCounts) {
      return;
    }

    this.store$.dispatch(new GetAllBrands({ page: 1, sort: EquipmentItemsSortOrder.AZ }));

    for (const type of this.types) {
      if (type.providedCount) {
        // Don't override provided count.
        continue;
      }

      this.loadingService.setLoading(true);

      type.count = this.equipmentApiService.itemCount(type.value).pipe(
        takeUntil(this.destroyed$),
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
        tap(count => {
          this.loadingService.setLoading(false);

          if (!!this.reviewPendingEditNotification) {
            this.popNotificationsService.remove(this.reviewPendingEditNotification.toastId);
          }

          if (
            count > 0 &&
            this.activatedRoute.snapshot?.url.join("/").indexOf("pending-edit-explorer") === -1 &&
            !this.activatedRoute.snapshot?.paramMap.get("itemId")
          ) {
            let message: string;

            if (count === 1) {
              message = this.translateService.instant(
                "There is <strong>1 item</strong> of this class that has pending edits."
              );
            } else {
              message = this.translateService.instant(
                "There are <strong>{{n}} items</strong> of this class that have pending edits.",
                { n: count }
              );
            }

            this.reviewPendingEditNotification = this.popNotificationsService.info(
              `${message} ` +
                this.translateService.instant(
                  "Please contribute to the AstroBin equipment database by " + "reviewing them!"
                ),
              null,
              {
                enableHtml: true,
                disableTimeOut: true,
                closeButton: true,
                buttons: [
                  {
                    id: "1",
                    title: this.translateService.instant("Review"),
                    classList: "btn btn-sm btn-secondary"
                  }
                ]
              }
            );

            if (!!this.reviewPendingEditNotification && !!this.reviewPendingEditNotification.onAction) {
              this.reviewPendingEditNotification.onAction.subscribe(() => {
                this.router.navigateByUrl(`/equipment/pending-edit-explorer/${type.value.toLowerCase()}`);
              });
            }
          }
        })
      );

      type.followedCount = this.equipmentApiService.getAllFollowedEquipmentItems(type.value).pipe(
        takeUntil(this.destroyed$),
        catchError(() => of({ count: 0 })),
        map(response => response.count),
        tap(() => this.loadingService.setLoading(false))
      );
    }
  }
}
