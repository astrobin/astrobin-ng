import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthLegacyApiService } from "./api/legacy/auth-legacy-api.service";
import { AuthNgApiService } from "./api/ng/auth-ng-api.service";
import { AppContextService } from "./app-context.service";
import * as jwt_decode from "jwt-decode";

export enum AuthServiceType {
  LEGACY,
  NG
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  static LEGACY_LOCAL_STORAGE_KEY = "legacy-auth-token";
  static NG_LOCAL_STORAGE_KEY = "ng-auth-token";

  constructor(
    public readonly authLegacyApi: AuthLegacyApiService,
    public readonly authNgApi: AuthNgApiService,
    public readonly appContext: AppContextService) {
  }

  public static getLegacyApiToken(): string {
    return localStorage.getItem(AuthService.LEGACY_LOCAL_STORAGE_KEY);
  }

  public static getNgApiToken(): string {
    return localStorage.getItem(AuthService.NG_LOCAL_STORAGE_KEY);
  }

  public login(handle: string, password: string): Observable<boolean> {
    return forkJoin([
      this.authLegacyApi.login(handle, password),
      this.authNgApi.login(handle, password),
    ]).pipe(
      map(tokens => {
        localStorage.setItem(AuthService.LEGACY_LOCAL_STORAGE_KEY, tokens[0]);
        localStorage.setItem(AuthService.NG_LOCAL_STORAGE_KEY, tokens[1]);
        this.appContext.load();
        return true;
      }),
      catchError(() => of(false)),
    );
  }

  public logout(): void {
    localStorage.removeItem(AuthService.LEGACY_LOCAL_STORAGE_KEY);
    localStorage.removeItem(AuthService.NG_LOCAL_STORAGE_KEY);
    this.appContext.load();
  }

  public isAuthenticated(): boolean {
    return AuthService.getLegacyApiToken() != null && AuthService.getNgApiToken() != null;
  }

  public userId(): string {
    return jwt_decode(AuthService.getNgApiToken());
  }
}
