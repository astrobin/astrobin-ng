import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
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

@Injectable({
  providedIn: "root"
})
export class AuthService extends BaseService implements AuthServiceInterface {
  static CLASSIC_AUTH_TOKEN_COOKIE = "classic-auth-token";

  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly authClassicApi: AuthClassicApiService,
    public cookieService: CookieService,
    public router: Router
  ) {
    super(loadingService);
  }

  getClassicApiToken(): string {
    return this.cookieService.get(AuthService.CLASSIC_AUTH_TOKEN_COOKIE);
  }

  login(handle: string, password: string, redirectUrl?: string): Observable<string> {
    return this.authClassicApi.login(handle, password);
  }

  logout(): void {
    if (this.cookieService.check(AuthService.CLASSIC_AUTH_TOKEN_COOKIE)) {
      this.cookieService.delete(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, "/");
      this.cookieService.delete(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, "/", ".localhost");
      this.cookieService.delete(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, "/", ".astrobin.com");
      this.router.navigate(["account", "logged-out"]);
    }
  }

  isAuthenticated$(): Observable<boolean> {
    return this.store$.select(selectCurrentUser).pipe(map(currentUser => !!currentUser));
  }
}
