import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TogglePropertyInterface } from "@shared/interfaces/toggle-property.interface";
import { TranslateService } from "@ngx-translate/core";
import { selectToggleProperty } from "@app/store/selectors/app/toggle-property.selectors";
import { LoadingService } from "@shared/services/loading.service";
import { CreateToggleProperty, CreateTogglePropertySuccess, DeleteToggleProperty, LoadToggleProperty } from "@app/store/actions/toggle-property.actions";
import { filter, map, takeUntil, tap } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { RouterService } from "@shared/services/router.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { DeviceService } from "@shared/services/device.service";
import { isPlatformBrowser } from "@angular/common";
import { fromEvent, merge, Subscription, throttleTime } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";

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
  btnClass: string = "btn btn-secondary";

  @Input()
  showLabel = true;

  @Input()
  showIcon = true;

  @Input()
  count: number;

  // Optionally provided, in case the parent component has this information at hand.
  @Input()
  toggled: boolean;

  // We keep a local "loading" state because we don't want to freeze the whole app.
  protected loading = false;
  protected initialized = false;
  protected isTouchDevice = false;

  private _toggleProperty: TogglePropertyInterface;
  private _subscriptions: Subscription = new Subscription();

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
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  get unsetTogglePropertyLabel(): string {
    if (this.unsetLabel) {
      return this.unsetLabel;
    }

    switch (this.propertyType) {
      case "like":
        return this.translateService.instant("Unlike");
      case "bookmark":
        return this.translateService.instant("Remove bookmark");
      case "follow":
        return this.translateService.instant("Unfollow");
    }
  }

  get setTogglePropertyLabel(): string {
    if (this.setLabel) {
      return this.setLabel;
    }

    switch (this.propertyType) {
      case "like":
        return this.translateService.instant("Like");
      case "bookmark":
        return this.translateService.instant("Bookmark");
      case "follow":
        return this.translateService.instant("Follow");
    }
  }

  get togglePropertyIcon(): IconProp {
    switch (this.propertyType) {
      case "like":
        return "thumbs-up";
      case "bookmark":
        return "bookmark";
      case "follow":
        return "bell";
    }
  }

  public ngOnInit(): void {
    this.isTouchDevice = this.deviceService.isTouchEnabled();
  }

  public ngOnChanges(): void {
    this.initialized = false;
    this.loading = false;

    if (isPlatformBrowser(this.platformId)) {
      if (this.utilsService.isNearOrInViewport(this.elementRef.nativeElement, {
        verticalTolerance: 500
      })) {
        this._initStatus();
      } else {
        const scrollElement = UtilsService.getScrollableParent(this.elementRef.nativeElement, this.windowRefService);
        const forceCheck$ = this.actions$.pipe(
          ofType(AppActionTypes.FORCE_CHECK_TOGGLE_PROPERTY_AUTO_LOAD)
        );

        merge(
          fromEvent(scrollElement, "scroll").pipe(throttleTime(500)),
          forceCheck$
        ).pipe(
          tap(() => {
            if (this.utilsService.isNearOrInViewport(this.elementRef.nativeElement, {
              verticalTolerance: 500
            })) {
              this._initStatus();
            }
          })
        ).subscribe();
      }
    }
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this._subscriptions.unsubscribe();
  }

  public onClick(event: MouseEvent | TouchEvent): void {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    if (!this.userId) {
      this.routerService.redirectToLogin();
      return;
    }

    this.loading = true;

    if (this._toggleProperty) {
      this.store$.dispatch(
        new DeleteToggleProperty({ toggleProperty: this._toggleProperty })
      );
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

    this.changeDetectorRef.detectChanges();
  }

  private _getFilterParams(toggleProperty: TogglePropertyInterface): boolean {
    return toggleProperty.propertyType === this.propertyType &&
      toggleProperty.user === this.userId &&
      toggleProperty.objectId === this.objectId &&
      toggleProperty.contentType === this.contentType;
  }

  private _getStoreParams(): Partial<TogglePropertyInterface> {
    return {
      propertyType: this.propertyType,
      user: this.userId,
      objectId: this.objectId,
      contentType: this.contentType
    };
  }

  private _initToggleProperty() {
    this.store$.pipe(
      select(selectToggleProperty(this._getStoreParams())),
      takeUntil(this.destroyed$),
      tap(toggleProperty => {
        this.toggled = !!toggleProperty;
        this._toggleProperty = toggleProperty;
        this.changeDetectorRef.markForCheck();
      })
    ).subscribe();

    this.store$.dispatch(new LoadToggleProperty({ toggleProperty: this._getStoreParams() }));
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

    if (this.toggled === undefined) {
      this._initToggleProperty();
    }

    this._subscriptions.unsubscribe();

    this._subscriptions.add(this.actions$.pipe(
      ofType(
        AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS,
        AppActionTypes.DELETE_TOGGLE_PROPERTY_FAILURE
      ),
      filter(this._getFilterParams.bind(this)),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }));

    this._subscriptions.add(this.actions$.pipe(
      ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS),
      map((action: CreateTogglePropertySuccess) => action.payload.toggleProperty),
      filter(this._getFilterParams.bind(this)),
      takeUntil(this.destroyed$)
    ).subscribe(toggleProperty => {
      this.utilsService.delay(50).subscribe(() => {
        this.toggled = true;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      });
    }));

    this._subscriptions.add(this.actions$.pipe(
      ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS),
      map((action: CreateTogglePropertySuccess) => action.payload.toggleProperty),
      filter(this._getFilterParams.bind(this)),
      takeUntil(this.destroyed$)
    ).subscribe(toggleProperty => {
      this._toggleProperty = null;
      this.toggled = false;
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }));

    this.initialized = true;
    this.changeDetectorRef.markForCheck();
  }
}
