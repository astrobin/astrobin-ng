import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnInit, OnDestroy, TemplateRef, ViewChild } from "@angular/core";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
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
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { selectUnreadNotificationsCount } from "@features/notifications/store/notifications.selectors";
import { UserInterface } from "@core/interfaces/user.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";

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
  @ViewChild("menuOffcanvas") menuOffcanvasTemplate: TemplateRef<any>;
  @ViewChild("loginRegisterMenu") loginRegisterMenuTemplate: TemplateRef<any>;
  @ViewChild("notificationsOffcanvas") notificationsOffcanvas: TemplateRef<any>;

  @HostBinding('class.header-hidden') isHeaderHidden = false;

  // Reference to the current offcanvas instance
  private activeOffcanvas: any = null;

  // Menu state
  currentMenuView: 'main' | 'language' | 'help' | 'moderate' = 'main';

  protected unreadNotificationsCount$: Observable<number> = this.store$.select(selectUnreadNotificationsCount).pipe(
    takeUntil(this.destroyed$)
  );

  // Language selector properties
  languages: LanguageInterface[] = [];
  currentLanguageCodeDisplay: string;
  helpWithTranslationsUrl = "https://translate.astrobin.com/projects/astrobin/astrobin";

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly authService: AuthService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly userService: UserService,
    private swipeToCloseService: SwipeToCloseService,
    private scrollHideService: ScrollHideService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.currentUserWrapper$.pipe(takeUntil(this.destroyed$)).subscribe(wrapper => {
      this.user = wrapper.user;
      this.userProfile = wrapper.userProfile;
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

  // Show the language submenu
  showLanguageMenu(): void {
    this.currentMenuView = 'language';
    this.changeDetectorRef.markForCheck();
  }

  // Show the help submenu
  showHelpMenu(): void {
    this.currentMenuView = 'help';
    this.changeDetectorRef.markForCheck();
  }

  // Show the moderate submenu
  showModerateMenu(): void {
    this.currentMenuView = 'moderate';
    this.changeDetectorRef.markForCheck();
  }

  // Return to the main menu from a submenu
  showMainMenu(): void {
    this.currentMenuView = 'main';
    this.changeDetectorRef.markForCheck();
  }

  // Open the main menu offcanvas
  openMainMenu() {
    // Reset to the main view first
    this.currentMenuView = 'main';

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
}
