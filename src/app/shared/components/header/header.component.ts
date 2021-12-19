import { Component, OnInit } from "@angular/core";
import { State } from "@app/store/state";
import { Logout } from "@features/account/store/auth.actions";
import { NotificationsService } from "@features/notifications/services/notifications.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { AuthService } from "@shared/services/auth.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable } from "rxjs";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { map, take, takeUntil } from "rxjs/operators";
import { UserInterface } from "@shared/interfaces/user.interface";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { CookieService } from "ngx-cookie-service";
import { Theme, ThemeService } from "@shared/services/theme.service";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";

interface AvailableLanguageInterface {
  code: string;
  label: string;
}

@Component({
  selector: "astrobin-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent extends BaseComponentDirective implements OnInit {
  isCollapsed = true;
  isAuthenticated = false;
  helpWithTranslationsUrl: string;

  languages: AvailableLanguageInterface[] = [
    { code: "en", label: "English (US)" },
    { code: "en-GB", label: "English (UK)" },
    { code: "-", label: "-" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
    { code: "pt", label: "Português" },
    { code: "zh-hans", label: "中文 (简体)" },
    { code: "-", label: "-" },
    { code: "ar", label: "العربية" },
    { code: "el", label: "Ελληνικά" },
    { code: "fi", label: "Suomi" },
    { code: "ja", label: "日本語" },
    { code: "nl", label: "Nederlands" },
    { code: "pl", label: "Polski" },
    { code: "ru", label: "Русский" },
    { code: "sq", label: "Shqipe" },
    { code: "tr", label: "Türkçe" }
  ];

  languageCodeDisplays: AvailableLanguageInterface[] = [
    { code: "en", label: "EN" },
    { code: "en-GB", label: "EN (GB)" },
    { code: "de", label: "DE" },
    { code: "es", label: "ES" },
    { code: "fr", label: "FR" },
    { code: "it", label: "IT" },
    { code: "pt", label: "PT" },
    { code: "zh-hans", label: "ZH (CN)" },
    { code: "ar", label: "AR" },
    { code: "el", label: "EL" },
    { code: "fi", label: "FI" },
    { code: "ja", label: "JA" },
    { code: "nl", label: "NL" },
    { code: "pl", label: "PL" },
    { code: "ru", label: "RU" },
    { code: "sq", label: "SQ" },
    { code: "tr", label: "TR" }
  ];

  constructor(
    public readonly store$: Store<State>,
    public readonly modalService: NgbModal,
    public readonly classicRoutes: ClassicRoutesService,
    public readonly authService: AuthService,
    public readonly notificationsService: NotificationsService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly cookieService: CookieService,
    public readonly themeService: ThemeService,
    public readonly jsonApiService: JsonApiService
  ) {
    super(store$);
  }

  get currentLanguageCodeDisplay(): string {
    let display = this.languageCodeDisplays.filter(item => item.code === (this.translateService.currentLang || "en"));
    if (!display) {
      display = this.languageCodeDisplays.filter(item => item.code === "en");
    }

    return display[0].label;
  }

  get helpWithTranslationsUrl$(): Observable<string> {
    return this.store$.select(selectCurrentUser).pipe(
      map((user: UserInterface) => {
        let path = `${this.classicRoutes.CONTACT}?subject=Help%20with%20translations`;

        if (!!user) {
          path += `&username=${user.username}`;
        }

        return path;
      })
    );
  }

  get imageIndexPopoverInfo(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(
      this.translateService.instant(
        "The <strong>Image Index</strong> is a system based on likes received on images, that incentivizes the " +
          "most active and liked members of the community. {{_0}}Learn more.{{_1}}",
        {
          _0: `<a href="https://welcome.astrobin.com/features/image-index" target="_blank">`,
          _1: "</a>"
        }
      )
    );
  }

  get contributionIndexPopoverInfo(): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(
      this.translateService.instant(
        "The <strong>Contribution Index (beta)</strong> is system to reward informative, constructive, and " +
          "valuable commentary on AstroBin. {{_0}}Learn more.{{_1}}",
        {
          _0: `<a href="https://welcome.astrobin.com/features/contribution-index" target="_blank">`,
          _1: "</a>"
        }
      )
    );
  }

  get loginUrl() {
    return `${this.classicRoutes.LOGIN}?next=${encodeURIComponent(this.windowRefService.getCurrentUrl().toString())}`;
  }

  ngOnInit() {
    this.authService
      .isAuthenticated$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isAuthenticated => (this.isAuthenticated = isAuthenticated));

    this.helpWithTranslationsUrl$.pipe(takeUntil(this.destroyed$)).subscribe(url => {
      this.helpWithTranslationsUrl = url;
    });
  }

  getSetLanguageUrl(languageCode: string): string {
    if (languageCode === "zh_Hans") {
      languageCode = "zh-hans";
    }

    return this.classicRoutes.SET_LANGUAGE(languageCode, this.windowRefService.nativeWindow.location.href);
  }

  logout($event) {
    $event.preventDefault();
    this.store$.dispatch(new Logout());
  }

  useHighContrastTheme(): boolean {
    return this.themeService.currentTheme() === Theme.HIGH_CONTRAST;
  }

  toggleHighContrastTheme(): void {
    this.jsonApiService
      .toggleUseHighContrastThemeCookie()
      .pipe(take(1))
      .subscribe(() => {
        this.themeService.setTheme();
      });
  }
}
