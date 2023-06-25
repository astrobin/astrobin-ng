import { Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ThemeService } from "@shared/services/theme.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { NotificationsApiService } from "@features/notifications/services/notifications-api.service";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { filter, map, take } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CookieConsentService } from "@shared/services/cookie-consent/cookie-consent.service";
import { CookieConsentEnum } from "@shared/types/cookie-consent.enum";
import { Observable } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { Constants } from "@shared/constants";

declare var dataLayer: any;
declare var gtag: any;

@Component({
  selector: "astrobin-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent extends BaseComponentDirective implements OnInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly router: Router,
    public readonly paginationConfig: NgbPaginationConfig,
    public readonly themeService: ThemeService,
    public readonly windowRefService: WindowRefService,
    public readonly notificationApiService: NotificationsApiService,
    public readonly cookieConsentService: CookieConsentService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: any,
    public readonly renderer: Renderer2
  ) {
    super(store$);
    this.initRouterEvents();
    this.initPagination();
    this.markNotificationAsRead();
    this.themeService.setTheme();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && Object.keys(this.windowRefService.nativeWindow).indexOf("Cypress") === -1) {
      this.includeAnalytics$().subscribe(includeAnalytics => {
        if (includeAnalytics) {
          this.utilsService.insertScript(
            `https://www.googletagmanager.com/gtag/js?id=${Constants.GOOGLE_ANALYTICS_ID}`,
            this.renderer
          );
          this.utilsService.insertScript(
            `https://www.googletagmanager.com/gtm.js?id=${Constants.GOOGLE_TAG_MANAGER_ID}`,
            this.renderer,
            () => {
              this.initGtag();
            });
        }
      });
    }
  }

  initGtag(): void {
    try {
      dataLayer = dataLayer || [];
    } catch (e) {
      return;
    }

    // @ts-ignore
    gtag("js", new Date());

    // @ts-ignore
    gtag("config", Constants.GOOGLE_ANALYTICS_ID, {
      linker: {
        domains: [
          "www.astrobin.com",
          "app.astrobin.com",
          "welcome.astrobin.com",
          "de.welcome.astrobin.com",
          "es.welcome.astrobin.com",
          "fr.welcome.astrobin.com",
          "it.welcome.astrobin.com",
          "pt.welcome.astrobin.com"
        ],
        accept_incoming: true
      }
    });

    // @ts-ignore
    gtag("config", "AW-1062298010");
  }

  initPagination(): void {
    this.paginationConfig.pageSize = 50;
    this.paginationConfig.maxSize = 5;
    this.paginationConfig.rotate = true;
  }

  initRouterEvents(): void {
    this.router.events?.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.tagGoogleAnalyticsPage(event.urlAfterRedirects);
      }
    });
  }

  includeAnalytics$(): Observable<boolean> {
    return this.store$.select(selectBackendConfig).pipe(
      filter(config => !!config),
      take(1),
      map(config => config.REQUEST_COUNTRY),
      map(countryCode => {
        const isGDPRCountry = UtilsService.isGDPRCountry(countryCode);
        const hasCookieConsent = this.cookieConsentService.cookieGroupAccepted(CookieConsentEnum.ANALYTICS);

        return !isGDPRCountry || hasCookieConsent;
      })
    );
  }

  tagGoogleAnalyticsPage(url: string): void {
    if (typeof gtag !== "undefined") {
      this.includeAnalytics$().subscribe(includeAnalytics => {
        if (includeAnalytics) {
          gtag("config", Constants.GOOGLE_ANALYTICS_ID, {
            page_path: url
          });
        }
      });
    }
  }

  markNotificationAsRead() {
    const url = this.windowRefService.getCurrentUrl();

    if (!!url && url.searchParams.get("utm_medium") === "email") {
      const fromUserPk = url.searchParams.get("from_user");
      this.notificationApiService
        .markAsReadByPathAndUser(url.pathname, fromUserPk !== "None" ? +fromUserPk : null)
        .subscribe();
    }
  }
}
