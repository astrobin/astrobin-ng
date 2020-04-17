import { Injectable } from "@angular/core";
import { WindowRefService } from "@lib/services/window-ref.service";
import { Observable, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { AppContextService } from "./app-context.service";

export enum AuthServiceType {
  // Classic Auth = against the regular Django AstroBin service.
  CLASSIC
}

@Injectable({
  providedIn: "root"
})
export class AuthService {
  static CLASSIC_LOCAL_STORAGE_KEY = "classic-auth-token";

  constructor(
    public authClassicApi: AuthClassicApiService,
    public appContext: AppContextService,
    public windowRef: WindowRefService
  ) {}

  public static getClassicApiToken(): string {
    return localStorage.getItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY);
  }

  public login(handle: string, password: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.authClassicApi
        .login(handle, password)
        .pipe(
          take(1),
          map(token => {
            localStorage.setItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY, token);
            this.appContext.load().then(() => {
              observer.next(true);
              observer.complete();
              this.windowRef.nativeWindow.location.reload();
            });
          }),
          catchError(() => of(false))
        )
        .subscribe();
    });
  }

  public logout(): void {
    if (localStorage.getItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY)) {
      localStorage.removeItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY);
      this.appContext.load().then(() => {
        this.windowRef.nativeWindow.location.reload();
      });
    }
  }

  public isAuthenticated(): boolean {
    return AuthService.getClassicApiToken() != null;
  }
}
