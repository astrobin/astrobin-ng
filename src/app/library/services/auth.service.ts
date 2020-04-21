import { Injectable } from "@angular/core";
import { AuthServiceInterface } from "@lib/services/auth.service-interface";
import { WindowRefService } from "@lib/services/window-ref.service";
import { CookieService } from "ngx-cookie-service";
import { Observable, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { AppContextService } from "./app-context.service";

@Injectable({
  providedIn: "root"
})
export class AuthService implements AuthServiceInterface {
  static CLASSIC_AUTH_TOKEN_COOKIE = "classic-auth-token";

  constructor(
    public authClassicApi: AuthClassicApiService,
    public appContext: AppContextService,
    public cookieService: CookieService,
    public windowRef: WindowRefService
  ) {}

  getClassicApiToken(): string {
    return this.cookieService.get(AuthService.CLASSIC_AUTH_TOKEN_COOKIE);
  }

  login(handle: string, password: string): Observable<boolean> {
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

            this.appContext.loadForUser().then(() => {
              this.cookieService.set(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, token, 180);
              observer.next(true);
              observer.complete();
            });
          })
        )
        .subscribe();
    });
  }

  logout(): void {
    if (this.cookieService.check(AuthService.CLASSIC_AUTH_TOKEN_COOKIE)) {
      this.cookieService.delete(AuthService.CLASSIC_AUTH_TOKEN_COOKIE);
      this.windowRef.nativeWindow.location.reload();
    }
  }

  isAuthenticated(): Observable<boolean> {
    return of(this.cookieService.check(AuthService.CLASSIC_AUTH_TOKEN_COOKIE));
  }
}
