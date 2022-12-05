import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges
} from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions, ofType } from "@ngrx/effects";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { fromEvent, Observable, of } from "rxjs";
import { catchError, debounceTime, map, takeUntil, tap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentApiService, EquipmentItemsSortOrder } from "@features/equipment/services/equipment-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentActionTypes, GetAllBrands } from "@features/equipment/store/equipment.actions";
import { WindowRefService } from "@shared/services/window-ref.service";
import { selectEquipment, selectEquipmentContributors } from "@features/equipment/store/equipment.selectors";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ActiveToast } from "ngx-toastr";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "astrobin-equipment-item-type-nav",
  templateUrl: "./item-type-nav.component.html",
  styleUrls: ["./item-type-nav.component.scss"]
})
export class ItemTypeNavComponent extends BaseComponentDirective
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input()
  excludeTypes: EquipmentItemType[] = [];

  @Input()
  enableCollapse = true;

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

  @Input()
  activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");

  @Output()
  collapsedChanged = new EventEmitter<boolean>();

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
    disabled?: boolean;
  }[];

  activeSubNav = "";
  reviewPendingEditNotification: ActiveToast<any>;
  isSmallDevice: boolean;
  collapsed: boolean;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly translateService: TranslateService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    @Inject(PLATFORM_ID) public readonly platformId
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.collapse();
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
    this.collapse();

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

  collapse() {
    if (!this.enableCollapse) {
      return;
    }

    if (!this.collapsed) {
      this.collapsed = true;
      this.collapsedChanged.emit(true);
    }
  }

  expand() {
    if (this.collapsed) {
      this.collapsed = false;
      this.collapsedChanged.emit(false);
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
    this.router.events?.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");
        this._setActiveSubNav(event.urlAfterRedirects);
        this.collapse();
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
        pendingEditCount: this.filtersPendingEditCount
      },
      {
        label: this.translateService.instant("Accessories"),
        value: EquipmentItemType.ACCESSORY,
        count: this.accessoryCount,
        providedCount: this.accessoryCount,
        pendingReviewCount: this.accessoriesPendingReviewCount,
        pendingEditCount: this.accessoriesPendingEditCount
      },
      {
        label: this.translateService.instant("Software"),
        value: EquipmentItemType.SOFTWARE,
        count: this.softwareCount,
        providedCount: this.softwareCount,
        pendingReviewCount: this.softwarePendingReviewCount,
        pendingEditCount: this.softwarePendingEditCount
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

            this.reviewPendingEditNotification.onAction.subscribe(() => {
              this.router.navigateByUrl(`/equipment/pending-edit-explorer/${type.value.toLowerCase()}`);
            });
          }
        })
      );
    }
  }
}
