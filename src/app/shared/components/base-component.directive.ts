import { Directive, OnDestroy, OnInit } from "@angular/core";
import { fromEvent, Observable, ReplaySubject, Subject } from "rxjs";
import { Store } from "@ngrx/store";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { debounceTime, map, switchMap, takeUntil } from "rxjs/operators";
import { distinctUntilKeyChangedOrNull } from "@shared/services/utils/utils.service";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { DeviceService } from "@shared/services/device.service";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";

@Directive()
export class BaseComponentDirective implements OnInit, OnDestroy {
  readonly componentId: string;

  title: string;
  destroyedSubject = new ReplaySubject<void>(1);
  destroyed$ = this.destroyedSubject.asObservable();

  windowWidthUpdateSubject = new Subject<number>();
  windowWidthUpdate$ = this.windowWidthUpdateSubject.asObservable();
  windowWidth: number;
  breakpointXxsMin: boolean;
  breakpointXxsMax: boolean;
  breakpointXsMin: boolean;
  breakpointXsMax: boolean;
  breakpointSmMin: boolean;
  breakpointSmMax: boolean;
  breakpointMdMin: boolean;
  breakpointMdMax: boolean;
  breakpointLgMin: boolean;
  breakpointLgMax: boolean;
  breakpointXlMin: boolean;
  breakpointXlMax: boolean;
  breakpointXxlMin: boolean;

  currentUser$: Observable<UserInterface | null>;
  currentUserProfile$: Observable<UserProfileInterface | null>;
  currentUserWrapper$: Observable<{ user: UserInterface | null; userProfile: UserProfileInterface | null }>;

  readOnlyMode$: Observable<boolean> = this.store$.select(selectApp).pipe(
    map(app => app.backendConfig.readOnly),
    takeUntil(this.destroyed$)
  );

  protected mobileMenuOpen: boolean;

  constructor(public readonly store$: Store) {
    this.componentId = Math.random().toString(36).substring(2);

    this.currentUser$ = this.store$
      .select(selectCurrentUser)
      .pipe(takeUntil(this.destroyed$), distinctUntilKeyChangedOrNull("id"));

    this.currentUserProfile$ = this.store$
      .select(selectCurrentUserProfile)
      .pipe(takeUntil(this.destroyed$), distinctUntilKeyChangedOrNull("id"));

    this.currentUserWrapper$ = this.store$.select(selectCurrentUser).pipe(
      takeUntil(this.destroyed$),
      switchMap(user =>
        this.store$.select(selectCurrentUserProfile).pipe(
          map(userProfile => ({
            user,
            userProfile
          }))
        )
      )
    );
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.destroyedSubject.next();
    this.destroyedSubject.complete();
  }

  protected initializeWindowWidthUpdate(
    platformId: Object,
    deviceService: DeviceService,
    windowRefService: WindowRefService
  ): void {
    const update = () => {
      this.windowWidth = windowRefService.nativeWindow.innerWidth;
      this.breakpointXxsMin = deviceService.xxsMin();
      this.breakpointXxsMax = deviceService.xxsMax();
      this.breakpointXsMin = deviceService.xsMin();
      this.breakpointXsMax = deviceService.xsMax();
      this.breakpointSmMin = deviceService.smMin();
      this.breakpointSmMax = deviceService.smMax();
      this.breakpointMdMin = deviceService.mdMin();
      this.breakpointMdMax = deviceService.mdMax();
      this.breakpointLgMin = deviceService.lgMin();
      this.breakpointLgMax = deviceService.lgMax();
      this.breakpointXlMin = deviceService.xlMin();
      this.breakpointXlMax = deviceService.xlMax();
      this.breakpointXxlMin = deviceService.xxlMin();
      this.windowWidthUpdateSubject.next(this.windowWidth);
    };

    if (isPlatformBrowser(platformId)) {
      fromEvent(windowRefService.nativeWindow, "resize").pipe(
        debounceTime(300),
        takeUntil(this.destroyed$)
      ).subscribe(() => {
        update();
      });

      update();
    }
  }

  protected onMobileMenuOpen() {
    this.mobileMenuOpen = true;
  }

  protected onMobileMenuClose() {
    this.mobileMenuOpen = false;
  }
}
