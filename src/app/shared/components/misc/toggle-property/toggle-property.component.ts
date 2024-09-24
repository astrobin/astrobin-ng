import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID } from "@angular/core";
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
import { fromEvent, throttleTime } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-toggle-property",
  templateUrl: "./toggle-property.component.html",
  styleUrls: ["./toggle-property.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TogglePropertyComponent extends BaseComponentDirective implements OnInit, OnChanges {
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

  toggleProperty: TogglePropertyInterface | null = null;

  // We keep a local "loading" state because we don't want to freeze the whole app.
  protected loading = false;
  protected initialized = false;
  protected isTouchDevice = false;
  protected toggled: boolean;

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
      if (this.utilsService.isNearBelowViewport(this.elementRef.nativeElement)) {
        this._initStatus();
      } else {
        const scrollElement = UtilsService.getScrollableParent(this.elementRef.nativeElement, this.windowRefService);
        fromEvent(scrollElement, "scroll").pipe(
          takeUntil(this.destroyed$),
          throttleTime(200),
          tap(() => {
            if (this.utilsService.isNearBelowViewport(this.elementRef.nativeElement)) {
              this._initStatus();
            }
          })
        ).subscribe();
      }
    }
  }

  public onClick(event: MouseEvent | TouchEvent, toggleProperty: Partial<TogglePropertyInterface>): void {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    if (!this.userId) {
      this.routerService.redirectToLogin();
      return;
    }

    this.loading = true;

    if (!!toggleProperty) {
      this.store$.dispatch(new DeleteToggleProperty({ toggleProperty }));
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

  private _initStatus(): void {
    if (this.initialized) {
      return;
    }

    if (!this.userId) {
      return;
    }

    const params: Partial<TogglePropertyInterface> = {
      propertyType: this.propertyType,
      user: this.userId,
      objectId: this.objectId,
      contentType: this.contentType
    };

    const filterParams = (toggleProperty: TogglePropertyInterface) => {
      return toggleProperty.propertyType === this.propertyType &&
        toggleProperty.user === this.userId &&
        toggleProperty.objectId === this.objectId &&
        toggleProperty.contentType === this.contentType;
    };

    this.store$.pipe(
      select(selectToggleProperty(params)),
      takeUntil(this.destroyed$),
      tap(toggleProperty => {
        this.toggleProperty = toggleProperty;
        this.toggled = !!toggleProperty;
        this.changeDetectorRef.markForCheck();
      })
    ).subscribe();

    this.store$.dispatch(new LoadToggleProperty({ toggleProperty: params }));

    this.actions$.pipe(
      ofType(
        AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS,
        AppActionTypes.DELETE_TOGGLE_PROPERTY_FAILURE
      ),
      filter(filterParams),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    });

    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS),
      map((action: CreateTogglePropertySuccess) => action.payload.toggleProperty),
      filter(filterParams),
      takeUntil(this.destroyed$)
    ).subscribe(toggleProperty => {
      this.utilsService.delay(50).subscribe(() => {
        this.toggleProperty = toggleProperty;
        this.toggled = true;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      });
    });

    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS),
      map((action: CreateTogglePropertySuccess) => action.payload.toggleProperty),
      filter(filterParams),
      takeUntil(this.destroyed$)
    ).subscribe(toggleProperty => {
      this.toggleProperty = null;
      this.toggled = false;
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    });

    this.initialized = true;
  }
}
