import { Injectable } from "@angular/core";
import { AuthServiceInterface } from "@lib/services/auth.service-interface";
import { WindowRefService } from "@lib/services/window-ref.service";
import { Observable, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { AppContextService } from "./app-context.service";

@Injectable({
  providedIn: "root"
})
export class AuthService implements AuthServiceInterface {
  static CLASSIC_LOCAL_STORAGE_KEY = "classic-auth-token";

  constructor(
    public authClassicApi: AuthClassicApiService,
    public appContext: AppContextService,
    public windowRef: WindowRefService
  ) {}

  static getClassicApiToken(): string {
    return localStorage.getItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY);
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

            localStorage.setItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY, token);
            this.appContext.load().then(() => {
              observer.next(true);
              observer.complete();
            });
          })
        )
        .subscribe();
    });
  }

  logout(): void {
    if (localStorage.getItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY)) {
      localStorage.removeItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY);
      this.appContext.load().then(() => {
        this.windowRef.nativeWindow.location.reload();
      });
    }
  }

  isAuthenticated(): boolean {
    return AuthService.getClassicApiToken() != null;
  }
}
