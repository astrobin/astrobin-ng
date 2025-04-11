import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectorRef,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  PLATFORM_ID
} from "@angular/core";
import { AppActionTypes } from "@app/store/actions/app.actions";
import {
  CreateTogglePropertySuccess,
  LoadTogglePropertiesFailure,
  LoadTogglePropertiesSuccess,
  LoadTogglePropertyFailure,
  CreateToggleProperty,
  DeleteToggleProperty,
  LoadToggleProperty,
  LoadTogglePropertySuccess
} from "@app/store/actions/toggle-property.actions";
import { MainState } from "@app/store/state";
import { TogglePropertyInterface } from "@core/interfaces/toggle-property.interface";
import { DeviceService } from "@core/services/device.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { RouterService } from "@core/services/router.service";
import { TogglePropertyBatchService } from "@core/services/toggle-property-batch.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { ViewportInitService } from "@core/services/viewport-initialization.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Subscription, Observable } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-toggle-property",
  templateUrl: "./toggle-property.component.html",
  styleUrls: ["./toggle-property.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TogglePropertyComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input()
  propertyType: TogglePropertyInterface["propertyType"];

  @Input()
  userId: TogglePropertyInterface["user"];

  @Input()
  objectId: TogglePropertyInterface["objectId"];

  @Input()
  contentType: TogglePropertyInterface["contentType"];

  @Input()
  disabled = false;

  @Input()
  setLabel: string;

  @Input()
  unsetLabel: string;

  @Input()
  btnClass = "btn btn-secondary";

  @Input()
  showIcon = true;

  @Input()
  showLabel = true;

  @Input()
  showTooltip = true;

  @Input()
  showLoadingIndicator = true;

  @Input()
  count: number;

  // Optionally provided, in case the parent component has this information at hand.
  @Input()
  toggled: boolean;

  // We keep a local "loading" state because we don't want to freeze the whole app.
  protected loading = false;
  // We distinguish between "toggling" and "loading" because we want to show an animation while toggling.
  protected toggling = false;
  protected initialized = false;
  protected isTouchDevice = false;
  protected setTogglePropertyLabel: string;
  protected unsetTogglePropertyLabel: string;
  protected togglePropertyIcon: IconProp;

  private _toggleProperty: TogglePropertyInterface;
  private _createSubscription: Subscription;
  private _createSubscriptionFailure: Subscription;
  private _deleteSubscription: Subscription;
  private _deleteSubscriptionFailure: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly routerService: RouterService,
    public readonly deviceService: DeviceService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly elementRef: ElementRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly viewportInitService: ViewportInitService,
    public readonly togglePropertyBatchService: TogglePropertyBatchService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  public ngOnInit(): void {
    this.isTouchDevice = this.deviceService.isTouchEnabled();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.initialized = false;
    this.loading = false;

    if (changes.propertyType) {
      this._initSetTogglePropertyLabel();
      this._initUnsetTogglePropertyLabel();
      this._initTogglePropertyIcon();
    }

    if (isPlatformBrowser(this.platformId)) {
      this.viewportInitService.register(this.componentId, this.elementRef, () => {
        this._initStatus();
        this.changeDetectorRef.markForCheck();
      });
    }

    this.actions$
      .pipe(ofType(AppActionTypes.FORCE_CHECK_TOGGLE_PROPERTY_AUTO_LOAD), takeUntil(this.destroyed$))
      .subscribe(() => {
        if (
          !this.initialized &&
          this.utilsService.isNearOrInViewport(this.elementRef.nativeElement, { verticalTolerance: 500 })
        ) {
          this._initStatus();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public ngOnDestroy(): void {
    this.viewportInitService.unregister(this.componentId);

    if (this._createSubscription) {
      this._createSubscription.unsubscribe();
    }

    if (this._createSubscriptionFailure) {
      this._createSubscriptionFailure.unsubscribe();
    }

    if (this._deleteSubscription) {
      this._deleteSubscription.unsubscribe();
    }

    if (this._deleteSubscriptionFailure) {
      this._deleteSubscriptionFailure.unsubscribe();
    }

    super.ngOnDestroy();
  }

  public onClick(event: MouseEvent | TouchEvent): void {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    if (!this.userId) {
      void this.routerService.redirectToLogin();
      return;
    }

    this.toggling = true;

    if (this.toggled) {
      if (this._toggleProperty) {
        this.store$.dispatch(new DeleteToggleProperty({ toggleProperty: this._toggleProperty }));
      } else {
        this._initToggleProperty()
          .pipe(
            filter(toggleProperty => !!toggleProperty),
            take(1)
          )
          .subscribe(toggleProperty => {
            if (toggleProperty) {
              this.store$.dispatch(new DeleteToggleProperty({ toggleProperty }));
            } else {
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    } else {
      this.store$.dispatch(
        new CreateToggleProperty({
          toggleProperty: {
            propertyType: this.propertyType,
            user: this.userId,
            objectId: this.objectId,
            contentType: this.contentType
          }
        })
      );
    }

    this.toggled = !this.toggled;

    if (this.count !== null && this.count !== undefined) {
      if (!this.toggled && this.count > 0) {
        this.count -= 1;
      } else if (this.toggled) {
        this.count += 1;
      }
    }
  }

  private _initUnsetTogglePropertyLabel(): void {
    if (this.unsetLabel) {
      this.unsetTogglePropertyLabel = this.unsetLabel;
      return;
    }

    switch (this.propertyType) {
      case "like":
        this.unsetTogglePropertyLabel = this.translateService.instant("Unlike");
        break;
      case "bookmark":
        this.unsetTogglePropertyLabel = this.translateService.instant("Remove bookmark");
        break;
      case "follow":
        this.unsetTogglePropertyLabel = this.translateService.instant("Unfollow");
        break;
    }
  }

  private _initSetTogglePropertyLabel(): void {
    if (this.setLabel) {
      this.setTogglePropertyLabel = this.setLabel;
      return;
    }

    switch (this.propertyType) {
      case "like":
        this.setTogglePropertyLabel = this.translateService.instant("Like");
        break;
      case "bookmark":
        this.setTogglePropertyLabel = this.translateService.instant("Bookmark");
        break;
      case "follow":
        this.setTogglePropertyLabel = this.translateService.instant("Follow");
        break;
    }
  }

  private _initTogglePropertyIcon(): void {
    switch (this.propertyType) {
      case "like":
        this.togglePropertyIcon = "thumbs-up";
        break;
      case "bookmark":
        this.togglePropertyIcon = "bookmark";
        break;
      case "follow":
        this.togglePropertyIcon = "bell";
        break;
    }
  }

  private _getFilterParams(toggleProperty: Partial<TogglePropertyInterface>): boolean {
    return (
      toggleProperty.propertyType === this.propertyType &&
      toggleProperty.user === this.userId &&
      toggleProperty.objectId === this.objectId &&
      toggleProperty.contentType === this.contentType
    );
  }

  private _initToggleProperty(): Observable<TogglePropertyInterface | null> {
    return new Observable<TogglePropertyInterface | null>(observer => {
      this.actions$
        .pipe(
          ofType(AppActionTypes.LOAD_TOGGLE_PROPERTIES_SUCCESS),
          map((action: LoadTogglePropertiesSuccess) => action.payload.toggleProperties),
          filter(toggleProperties => {
            // Find our toggle property in the batch response
            return toggleProperties.some(tp => this._getFilterParams(tp));
          }),
          take(1)
        )
        .subscribe(toggleProperties => {
          const toggleProperty = toggleProperties.find(tp => this._getFilterParams(tp));
          this._toggleProperty = toggleProperty || null;
          this.toggled = !!toggleProperty;
          this.toggling = false;
          this.initialized = true;
          observer.next(toggleProperty || null);
          observer.complete();
          this.changeDetectorRef.markForCheck();
        });

      this.actions$
        .pipe(
          ofType(AppActionTypes.LOAD_TOGGLE_PROPERTIES_FAILURE),
          map((action: LoadTogglePropertiesFailure) => action.payload.toggleProperties),
          filter(toggleProperties => {
            // Find our toggle property in the batch response
            return toggleProperties.some(tp => this._getFilterParams(tp));
          }),
          take(1)
        )
        .subscribe(() => {
          this._toggleProperty = null;
          this.toggled = false;
          this.toggling = false;
          this.initialized = true;
          observer.next(null);
          observer.complete();
          this.changeDetectorRef.markForCheck();
        });

      this.togglePropertyBatchService.checkToggleProperty(
        this.propertyType,
        this.userId,
        this.objectId,
        this.contentType
      );
    });
  }

  private _initStatus(): void {
    if (this.initialized) {
      return;
    }

    if (!this.userId) {
      this.initialized = true;
      this.toggled = false;
      this._toggleProperty = null;
      this.changeDetectorRef.markForCheck();
      return;
    }

    if (this.toggled !== undefined) {
      this.initialized = true;
      this.changeDetectorRef.markForCheck();
    } else {
      this._initToggleProperty().subscribe();
    }

    if (this._createSubscription) {
      this._createSubscription.unsubscribe();
    }

    if (this._createSubscriptionFailure) {
      this._createSubscriptionFailure.unsubscribe();
    }

    if (this._deleteSubscription) {
      this._deleteSubscription.unsubscribe();
    }

    if (this._deleteSubscriptionFailure) {
      this._deleteSubscriptionFailure.unsubscribe();
    }

    this._createSubscription = this.actions$
      .pipe(
        ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS),
        map((action: CreateTogglePropertySuccess) => action.payload.toggleProperty),
        filter(this._getFilterParams.bind(this)),
        takeUntil(this.destroyed$)
      )
      .subscribe(toggleProperty => {
        this.utilsService.delay(50).subscribe(() => {
          this._toggleProperty = toggleProperty;
          this.toggled = true;
          this.toggling = false;
          this.changeDetectorRef.markForCheck();
        });
      });

    this._createSubscriptionFailure = this.actions$
      .pipe(
        ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_FAILURE),
        map((action: LoadTogglePropertyFailure) => action.payload.toggleProperty),
        filter(this._getFilterParams.bind(this)),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.toggling = false;
        this.toggled = false;
        if (this.count !== null && this.count !== undefined) {
          // Restore count.
          this.count += 1;
        }
        this.popNotificationsService.error(
          this.translateService.instant("An error occurred while trying to perform this operation.")
        );
        this.changeDetectorRef.markForCheck();
      });

    this._deleteSubscription = this.actions$
      .pipe(
        ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS),
        map((action: CreateTogglePropertySuccess) => action.payload.toggleProperty),
        filter(this._getFilterParams.bind(this)),
        takeUntil(this.destroyed$)
      )
      .subscribe(toggleProperty => {
        this._toggleProperty = null;
        this.toggled = false;
        this.toggling = false;
        this.changeDetectorRef.markForCheck();
      });

    this._deleteSubscriptionFailure = this.actions$
      .pipe(
        ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_FAILURE),
        map((action: LoadTogglePropertyFailure) => action.payload.toggleProperty),
        filter(this._getFilterParams.bind(this)),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.toggling = false;
        this.toggled = true;
        if (this.count !== null && this.count !== undefined && this.count > 0) {
          // Restore count.
          this.count += 1;
        }
        this.popNotificationsService.error(
          this.translateService.instant("An error occurred while trying to perform this operation.")
        );
        this.changeDetectorRef.markForCheck();
      });
  }
}
