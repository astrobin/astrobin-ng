import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthServiceInterface } from "@shared/services/auth.service-interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { CookieService } from "ngx-cookie-service";
import { Observable, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { AppContextService } from "./app-context.service";

@Injectable({
  providedIn: "root"
})
export class AuthService extends BaseService implements AuthServiceInterface {
  static CLASSIC_AUTH_TOKEN_COOKIE = "classic-auth-token";

  constructor(
    public loadingService: LoadingService,
    public authClassicApi: AuthClassicApiService,
    public appContext: AppContextService,
    public cookieService: CookieService,
    public router: Router
  ) {
    super(loadingService);
  }

  getClassicApiToken(): string {
    return this.cookieService.get(AuthService.CLASSIC_AUTH_TOKEN_COOKIE);
  }

  login(handle: string, password: string, redirectUrl?: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.authClassicApi
        .login(handle, password)
        .pipe(
          take(1),
          catchError(error => {
            // tslint:disable-next-line:no-console
            console.error(error);
            return of(undefined);
          }),
          map(token => {
            if (!token) {
              observer.next(false);
              observer.complete();
              return;
            }

            this.cookieService.set(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, token, 180);
            this.appContext.loadForUser().then(() => {
              this.router.navigate(["account", "logged-in"], { queryParams: { redirectUrl } }).then(() => {
                observer.next(true);
                observer.complete();
              });
            });
          })
        )
        .subscribe();
    });
  }

  logout(): void {
    if (this.cookieService.check(AuthService.CLASSIC_AUTH_TOKEN_COOKIE)) {
      this.cookieService.delete(AuthService.CLASSIC_AUTH_TOKEN_COOKIE);
      this.router.navigate(["account", "logged-out"]);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return of(this.cookieService.check(AuthService.CLASSIC_AUTH_TOKEN_COOKIE));
  }
}
