import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { AuthService } from "@core/services/auth.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { LoadingService } from "@core/services/loading.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { DeviceService } from "@core/services/device.service";
import { UserService } from "@core/services/user.service";
import { SwipeToCloseService } from "@core/services/swipe-to-close.service";
import { ScrollHideService } from "@core/services/scroll-hide.service";
import { MobilePageMenuConfig, MobilePageMenuService } from "@core/services/mobile-page-menu.service";
import { LocalStorageService } from "@core/services/localstorage.service";
import { Observable } from "rxjs";
import { delay, filter, map, take, takeUntil } from "rxjs/operators";
import { selectUnreadNotificationsCount } from "@features/notifications/store/notifications.selectors";
import { UserInterface } from "@core/interfaces/user.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { environment } from "@env/environment";

interface LanguageInterface {
  code: string;
  label: string;
}

@Component({
  selector: "astrobin-mobile-header",
  templateUrl: "./mobile-header.component.html",
  styleUrls: ["./mobile-header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileHeaderComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  user: UserInterface;
  userProfile: UserProfileInterface;
  currentUserWrapper: { user: UserInterface | null; userProfile: UserProfileInterface | null };
  @ViewChild("menuOffcanvas") menuOffcanvasTemplate: TemplateRef<any>;
  @ViewChild("loginRegisterMenu") loginRegisterMenuTemplate: TemplateRef<any>;
  @ViewChild("notificationsOffcanvas") notificationsOffcanvas: TemplateRef<any>;

  @HostBinding('class.header-hidden') isHeaderHidden = false;

  // Reference to the current offcanvas instance
  private activeOffcanvas: any = null;

  // Menu state
  currentMenuView: 'main' | 'language' | 'help' | 'moderate' = 'main';

  // Page menu state
  pageMenuConfig$: Observable<MobilePageMenuConfig>;
  hasPageMenu$: Observable<boolean>;
  pageMenuOpenState$: Observable<boolean>;

  // PWA mode state
  isPwaMode$: Observable<boolean>;

  // Kebab menu tooltip state
  showKebabMenuTooltip = false;
  private readonly KEBAB_TOOLTIP_DISMISSED_KEY = 'astrobin-kebab-menu-tooltip-dismissed';
  private readonly KEBAB_TOOLTIP_SHOWN_DATES_KEY = 'astrobin-kebab-menu-tooltip-shown-dates';
  private readonly KEBAB_TOOLTIP_MAX_DAYS = 4;

  protected unreadNotificationsCount$: Observable<number> = this.store$.select(selectUnreadNotificationsCount).pipe(
    takeUntil(this.destroyed$)
  );

  // Language selector properties
  languages: LanguageInterface[] = [];
  currentLanguageCodeDisplay: string;
  helpWithTranslationsUrl = "https://translate.astrobin.com/projects/astrobin/astrobin";

  // Footer information
  readonly currentYear: number = new Date().getFullYear();
  readonly buildVersion: string = environment.buildVersion;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly authService: AuthService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly modalService: NgbModal,
    public readonly deviceService: DeviceService,
    public readonly userService: UserService,
    private swipeToCloseService: SwipeToCloseService,
    private scrollHideService: ScrollHideService,
    private mobilePageMenuService: MobilePageMenuService,
    private localStorageService: LocalStorageService
  ) {
    super(store$);
    this.isPwaMode$ = this.deviceService.isPwaMode$;
  }

  ngOnInit() {
    super.ngOnInit();

    this.currentUserWrapper$.pipe(takeUntil(this.destroyed$)).subscribe(wrapper => {
      this.user = wrapper.user;
      this.userProfile = wrapper.userProfile;
      this.currentUserWrapper = wrapper;
      this.changeDetectorRef.markForCheck();
    });

    // Subscribe to header visibility changes from the service
    this.scrollHideService.getHeaderVisibility()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isHidden => {
        this.isHeaderHidden = isHidden;
        this.changeDetectorRef.markForCheck();
      });

    // Initialize the language selector
    this.initializeLanguageSelector();

    // Initialize page menu observables
    this.pageMenuConfig$ = this.mobilePageMenuService.getMenuConfig();
    this.hasPageMenu$ = this.pageMenuConfig$.pipe(
      map(config => !!config && !!config.template),
      takeUntil(this.destroyed$)
    );
    this.pageMenuOpenState$ = this.mobilePageMenuService.getMenuOpenState();

    // Initialize kebab menu tooltip - show once per day for up to KEBAB_TOOLTIP_MAX_DAYS days
    this.hasPageMenu$
      .pipe(
        filter(hasMenu => hasMenu),
        take(1),
        delay(1000) // Delay showing the tooltip to avoid immediate display
      )
      .subscribe(() => {
        const tooltipDismissed = this.localStorageService.getItem(this.KEBAB_TOOLTIP_DISMISSED_KEY);

        if (tooltipDismissed === 'true') {
          // User has explicitly dismissed the tooltip for good
          return;
        }

        // Get stored dates when tooltip was shown
        const shownDatesJson = this.localStorageService.getItem(this.KEBAB_TOOLTIP_SHOWN_DATES_KEY) || '[]';
        let shownDates: string[] = [];

        try {
          shownDates = JSON.parse(shownDatesJson);
        } catch (e) {
          console.error('Error parsing stored dates', e);
        }

        // Get today's date as YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Check if we've already shown the tooltip today
        if (shownDates.includes(today)) {
          return;
        }

        // If we've shown it less than MAX_DAYS times, show it again
        if (shownDates.length < this.KEBAB_TOOLTIP_MAX_DAYS) {
          // Add today to the shown dates
          shownDates.push(today);

          // Store updated dates
          this.localStorageService.setItem(
            this.KEBAB_TOOLTIP_SHOWN_DATES_KEY,
            JSON.stringify(shownDates)
          );

          // Show the tooltip
          this.showKebabMenuTooltip = true;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  initializeLanguageSelector(): void {
    const supportedLanguages = [
      { code: "en", label: "English" },
      { code: "de", label: "Deutsch" },
      { code: "es", label: "Español" },
      { code: "fr", label: "Français" },
      { code: "it", label: "Italiano" },
      { code: "ja", label: "日本語" },
      { code: "nl", label: "Nederlands" },
      { code: "pl", label: "Polski" },
      { code: "pt", label: "Português" },
      { code: "ru", label: "Русский" },
      { code: "sq", label: "Shqip" },
      { code: "tr", label: "Türkçe" },
      { code: "zh_Hans", label: "简体中文" }
    ];

    this.languages = supportedLanguages;

    // Set current language display code
    const currentLang = this.translateService.currentLang || "en";
    const foundLang = this.languages.find(lang => lang.code === currentLang);
    this.currentLanguageCodeDisplay = foundLang ? foundLang.code.toUpperCase() : "EN";
  }

  getSetLanguageUrl(languageCode: string): string {
    // Get the current URL and append the language param
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', languageCode);
      return url.toString();
    }

    return `?lang=${languageCode}`;
  }

  // Add a flag to track if this is a view transition (not initial load)
  private isViewTransition = false;

  // Show the language submenu
  showLanguageMenu(): void {
    this.isViewTransition = true;
    this.currentMenuView = 'language';
    this.changeDetectorRef.markForCheck();
  }

  // Show the help submenu
  showHelpMenu(): void {
    this.isViewTransition = true;
    this.currentMenuView = 'help';
    this.changeDetectorRef.markForCheck();
  }

  // Show the moderate submenu
  showModerateMenu(): void {
    this.isViewTransition = true;
    this.currentMenuView = 'moderate';
    this.changeDetectorRef.markForCheck();
  }

  // Return to the main menu from a submenu
  showMainMenu(): void {
    this.isViewTransition = true;
    this.currentMenuView = 'main';
    this.changeDetectorRef.markForCheck();
  }

  // Expose the transition flag to the template
  isInViewTransition(): boolean {
    return this.isViewTransition;
  }

  // Open the main menu offcanvas
  openMainMenu() {
    // Reset to the main view first and disable transition animation
    this.currentMenuView = 'main';
    this.isViewTransition = false;

    // Add class to prevent body scrolling
    this.addScrollLock();

    // Open the offcanvas
    this.activeOffcanvas = this.offcanvasService.open(this.menuOffcanvasTemplate, {
      position: "start",
      panelClass: "mobile-main-menu",
      backdrop: true
    });

    // Remove the scroll lock when the offcanvas is dismissed
    this.activeOffcanvas.dismissed.subscribe(() => {
      this.removeScrollLock();
      this.isViewTransition = false; // Reset on close
    });
  }

  openUserMenu() {
    if (this.user) {
      // Navigate to user gallery
      this.userService.openGallery(this.user.username, this.userProfile?.enableNewGalleryExperience);
    } else {
      // Add class to prevent body scrolling
      this.addScrollLock();

      // Open login/register menu
      const ref = this.offcanvasService.open(this.loginRegisterMenuTemplate, {
        position: "end",
        panelClass: "mobile-login-menu",
        backdrop: true
      });

      // Remove the class when the offcanvas is dismissed
      ref.dismissed.subscribe(() => {
        this.removeScrollLock();
      });
    }
  }

  openNotificationsOffcanvas(): void {
    // Add class to prevent body scrolling
    this.addScrollLock();

    const ref = this.offcanvasService.open(this.notificationsOffcanvas, {
      panelClass: "notifications-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });

    // Remove the class when the offcanvas is dismissed
    ref.dismissed.subscribe(() => {
      this.removeScrollLock();
    });
  }

  /**
   * Open the page-specific kebab menu (triggered by icon or service)
   */
  openPageMenu(): void {
    this.mobilePageMenuService.openMenu();
  }



  /**
   * Helper method to safely add scroll lock on body
   * Checks for browser environment to avoid SSR issues
   */
  private addScrollLock(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.add('offcanvas-open');
    }
  }

  /**
   * Helper method to safely remove scroll lock from body
   * Checks for browser environment to avoid SSR issues
   */
  private removeScrollLock(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('offcanvas-open');
    }
  }

  protected onMobileMenuOpen(): void {
    // Any additional logic to handle menu opening
  }

  protected onMobileMenuClose(): void {
    // Any additional logic to handle menu closing
  }

  /**
   * Dismisses the kebab menu tooltip and updates localStorage
   */
  dismissKebabMenuTooltip(): void {
    this.showKebabMenuTooltip = false;
    this.changeDetectorRef.markForCheck();
  }
}
