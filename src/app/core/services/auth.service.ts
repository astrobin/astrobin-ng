import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { AuthServiceInterface } from "@core/services/auth.service-interface";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { CookieService } from "ngx-cookie";
import { Observable, of } from "rxjs";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { WindowRefService } from "@core/services/window-ref.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class AuthService extends BaseService implements AuthServiceInterface {
  static readonly CLASSIC_AUTH_TOKEN_COOKIE = "classic-auth-token";
  readonly isBrowser: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly authClassicApi: AuthClassicApiService,
    public readonly cookieService: CookieService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly router: Router,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(loadingService);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getClassicApiToken(): string {
    return this.cookieService.get(AuthService.CLASSIC_AUTH_TOKEN_COOKIE);
  }

  login(handle: string, password: string, _redirectUrl?: string): Observable<string> {
    return this.authClassicApi.login(handle, password);
  }

  logout(): Observable<void> {
    return new Observable<void>(observer => {
      this.router.navigate(["account", "logging-out"]).then(() => {
        this.removeAuthenticationToken();
        observer.next();
        observer.complete();

        this.redirectToBackendLogout();
      });
    });
  }

  removeAuthenticationToken() {
    if (!this.isBrowser) {
      return;
    }

    let domain: string;
    const url = this.windowRefService.getCurrentUrl().toString();

    if (url?.includes("astrobin.com")) {
      domain = ".astrobin.com";
    } else if (url?.includes("localhost")) {
      domain = "localhost";
    }

    if (domain) {
      this.cookieService.remove(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, {
        path: "/",
        domain
      });
    }
  }

  getLoginUrl(redirectUrl?: string): string {
    if (redirectUrl === undefined) {
      redirectUrl = this.windowRefService.getCurrentUrl().toString();
    }

    return `${this.classicRoutesService.LOGIN}?next=${encodeURIComponent(redirectUrl)}`;
  }

  redirectToBackendLogin(redirectUrl?: string) {
    if (!(this.windowRefService.nativeWindow as any).Cypress) {
      this.windowRefService.locationAssign(this.getLoginUrl(redirectUrl));
    }
  }

  redirectToBackendLogout() {
    if (!(this.windowRefService.nativeWindow as any).Cypress) {
      this.windowRefService.locationAssign(this.classicRoutesService.LOGOUT);
    }
  }

  isAuthenticated$(): Observable<boolean> {
    return of(!!this.getClassicApiToken());
  }
}
