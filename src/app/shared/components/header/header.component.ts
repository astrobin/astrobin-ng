import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from "@angular/core";
import { MainState } from "@app/store/state";
import { Logout } from "@features/account/store/auth.actions";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { AuthService } from "@core/services/auth.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { LoadingService } from "@core/services/loading.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Observable } from "rxjs";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { UserInterface } from "@core/interfaces/user.interface";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { CookieService } from "ngx-cookie";
import { Theme, ThemeService } from "@core/services/theme.service";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import { NavigationEnd, Router } from "@angular/router";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UtilsService } from "@core/services/utils/utils.service";
import { UserService } from "@core/services/user.service";
import { SearchService } from "@core/services/search.service";
import { MatchType } from "@features/search/enums/match-type.enum";
import { selectUnreadNotificationsCount } from "@features/notifications/store/notifications.selectors";
import { DeviceService } from "@core/services/device.service";
import { AvailableLanguageInterface, Constants } from "@shared/constants";


@Component({
  selector: "astrobin-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent extends BaseComponentDirective implements OnInit {
  menubarIsCollapsed = true;
  userMenubarIsCollapsed = true;
  helpWithTranslationsUrl: string;
  user: UserInterface;
  userProfile: UserProfileInterface;
  showMobileSearch = false;
  isSearchPage = false;
  quickSearchQuery: string;
  languages: AvailableLanguageInterface[] = Constants.LANGUAGES;
  languageCodeDisplays: AvailableLanguageInterface[] = [
    { code: "en", label: "EN" },
    { code: "en-GB", label: "EN (GB)" },
    { code: "de", label: "DE" },
    { code: "es", label: "ES" },
    { code: "fr", label: "FR" },
    { code: "it", label: "IT" },
    { code: "pt", label: "PT" },
    { code: "zh-hans", label: "ZH (CN)" },
    { code: "el", label: "EL" },
    { code: "fi", label: "FI" },
    { code: "ja", label: "JA" },
    { code: "hu", label: "HU" },
    { code: "nl", label: "NL" },
    { code: "pl", label: "PL" },
    { code: "uk", label: "UK" },
    { code: "ru", label: "RU" },
    { code: "sq", label: "SQ" },
    { code: "tr", label: "TR" }
  ];

  @ViewChild("sidebar") sidebar: ElementRef;
  @ViewChild("userSidebar") userSidebar: ElementRef;
  @ViewChildren("quickSearchInput") quickSearchInputs: QueryList<ElementRef>;
  @ViewChild("notificationsOffcanvas") notificationsOffcanvas: TemplateRef<any>;

  protected unreadNotificationsCount$: Observable<number> = this.store$.select(selectUnreadNotificationsCount).pipe(
    takeUntil(this.destroyed$)
  );

  protected helpWithTranslationsUrl$: Observable<string> = this.store$.select(selectCurrentUser).pipe(
    map((user: UserInterface) => {
      let path = `${this.classicRoutesService.CONTACT}?subject=Help%20with%20translations`;

      if (!!user) {
        path += `&username=${user.username}`;
      }

      return path;
    })
  );

  protected imageIndexPopoverInfo: SafeHtml = this.domSanitizer.bypassSecurityTrustHtml(
    this.translateService.instant(
      "The <strong>Image Index</strong> is a system based on likes received on images, that incentivizes the " +
      "most active and liked members of the community. {{_0}}Learn more.{{_1}}",
      {
        _0: `<a href="https://welcome.astrobin.com/features/image-index" target="_blank">`,
        _1: "</a>"
      }
    )
  );

  protected contributionIndexPopoverInfo: SafeHtml = this.domSanitizer.bypassSecurityTrustHtml(
    this.translateService.instant(
      "The <strong>Contribution Index (beta)</strong> is system to reward informative, constructive, and " +
      "valuable commentary on AstroBin. {{_0}}Learn more.{{_1}}",
      {
        _0: `<a href="https://welcome.astrobin.com/features/contribution-index" target="_blank">`,
        _1: "</a>"
      }
    )
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modalService: NgbModal,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly authService: AuthService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly cookieService: CookieService,
    public readonly themeService: ThemeService,
    public readonly jsonApiService: JsonApiService,
    public readonly router: Router,
    public readonly utilsService: UtilsService,
    public readonly userService: UserService,
    public readonly searchService: SearchService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService
  ) {
    super(store$);
  }

  get currentLanguageCodeDisplay(): string {
    let display = this.languageCodeDisplays.filter(item => item.code === (this.translateService.currentLang || "en"));

    if (!display) {
      display = this.languageCodeDisplays.filter(item => item.code === "en");
    }

    if (!display || display.length === 0) {
      return "EN";
    }

    return display[0].label;
  }

  ngOnInit() {
    super.ngOnInit();

    this.helpWithTranslationsUrl$.pipe(takeUntil(this.destroyed$)).subscribe(url => {
      this.helpWithTranslationsUrl = url;
      this.changeDetectorRef.markForCheck();
    });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.isSearchPage = this.router.url.startsWith("/search");
        this.closeSidebarMenu();
        this.closeUserSidebarMenu();
        this.changeDetectorRef.markForCheck();
      });

    this.currentUserWrapper$.pipe(takeUntil(this.destroyed$)).subscribe(wrapper => {
      this.user = wrapper.user;
      this.userProfile = wrapper.userProfile;
      this.changeDetectorRef.markForCheck();
    });
  }

  onQuickSearchSubmit(event: Event) {
    event.preventDefault();

    this.searchService.magicAutocomplete$(this.quickSearchQuery).pipe(take(1)).subscribe((result) => {
      let params: string;

      if (result) {
        params = this.searchService.modelToParams({
          [result.type]: result.value
        });
      } else {
        params = this.searchService.modelToParams({
          text: {
            value: this.quickSearchQuery,
            matchType: MatchType.ALL,
            onlySearchInTitlesAndDescriptions: this.searchService.isSimpleMode()
          }
        });
      }

      this.router.navigateByUrl(`/search?p=${params}`).then(() => {
        this.quickSearchQuery = "";
        this.changeDetectorRef.markForCheck();
      });
    });
  }

  onShowMobileSearchClick(event: Event) {
    event.preventDefault();

    this.showMobileSearch = true;

    this.utilsService.delay(1).subscribe(() => {
      this.quickSearchInputs.forEach((input: ElementRef) => {
        if (input.nativeElement.offsetParent !== null) {
          input.nativeElement.focus();
        }
      });
    });
  }

  getSetLanguageUrl(languageCode: string): string {
    if (languageCode === "zh_Hans") {
      languageCode = "zh-hans";
    }

    return this.classicRoutesService.SET_LANGUAGE(languageCode, this.windowRefService.nativeWindow.location.href);
  }

  logout($event) {
    $event.preventDefault();
    this.store$.dispatch(new Logout());
  }

  useHighContrastTheme(): boolean {
    return this.themeService.preferredTheme() === Theme.HIGH_CONTRAST;
  }

  toggleHighContrastTheme(event: Event): void {
    event.preventDefault();

    this.jsonApiService
      .toggleUseHighContrastThemeCookie()
      .pipe(take(1))
      .subscribe(() => {
        this.themeService.setTheme();
        this.changeDetectorRef.markForCheck();
      });
  }

  openSidebarMenu() {
    this.menubarIsCollapsed = false;
    this.sidebar.nativeElement.scrollTop = 0;
  }

  closeSidebarMenu() {
    this.menubarIsCollapsed = true;
  }

  openUserSidebarMenu() {
    this.userMenubarIsCollapsed = false;
    this.userSidebar.nativeElement.scrollTop = 0;
  }

  closeUserSidebarMenu() {
    this.userMenubarIsCollapsed = true;
  }

  openNotificationsOffcanvas(): void {
    this.offcanvasService.open(this.notificationsOffcanvas,{
      panelClass: "notifications-offcanvas",
      position: this.deviceService.offcanvasPosition(),
    });
  }
}
