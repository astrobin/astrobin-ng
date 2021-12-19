import { Injectable } from "@angular/core";
import { AuthServiceInterface } from "@shared/services/auth.service-interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { CookieService } from "ngx-cookie-service";
import { Observable } from "rxjs";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { selectCurrentUser } from "@features/account/store/auth.selectors";
import { map } from "rxjs/operators";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Router } from "@angular/router";
import {} from "@ngrx/store/src/meta-reducers/utils";

@Injectable({
  providedIn: "root"
})
export class AuthService extends BaseService implements AuthServiceInterface {
  static CLASSIC_AUTH_TOKEN_COOKIE = "classic-auth-token";

  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly authClassicApi: AuthClassicApiService,
    public readonly cookieService: CookieService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly router: Router
  ) {
    super(loadingService);
  }

  getClassicApiToken(): string {
    return this.cookieService.get(AuthService.CLASSIC_AUTH_TOKEN_COOKIE);
  }

  login(handle: string, password: string, redirectUrl?: string): Observable<string> {
    return this.authClassicApi.login(handle, password);
  }

  logout(): Observable<void> {
    return new Observable<void>(observer => {
      this.router.navigate(["account", "logging-out"]).then(() => {
        for (const domain of [".astrobin.com", "localhost"]) {
          this.cookieService.delete(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, "/", domain);
        }

        observer.next();
        observer.complete();

        if (!(this.windowRefService.nativeWindow as any).Cypress) {
          this.windowRefService.locationAssign(this.classicRoutesService.LOGOUT);
        }
      });
    });
  }

  isAuthenticated$(): Observable<boolean> {
    return this.store$.select(selectCurrentUser).pipe(map(currentUser => !!currentUser));
  }
}
