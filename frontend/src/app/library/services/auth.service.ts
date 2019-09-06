import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthLegacyApiService } from "./api/legacy/auth-legacy-api.service";
import { AuthApiService } from "./api/interfacees/auth-api.service.interface";
import { AuthNgApiService } from "./api/ng/auth-ng-api.service";
import { AppContextService } from "./app-context.service";

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
    public authLegacyApi: AuthLegacyApiService,
    public authNgApi: AuthNgApiService,
    public appContext: AppContextService) {
  }

  public static getToken(): string {
    return localStorage.getItem(AuthService.LEGACY_LOCAL_STORAGE_KEY);
  }

  public login(handle: string, password: string, type = AuthServiceType.LEGACY): Observable<boolean> {
    let api: AuthApiService;
    let localStorageKey: string;

    if (type === AuthServiceType.LEGACY) {
      api = this.authLegacyApi;
      localStorageKey = AuthService.LEGACY_LOCAL_STORAGE_KEY;
    } else {
      api = this.authNgApi;
      localStorageKey = AuthService.NG_LOCAL_STORAGE_KEY;
    }

    return api.login(handle, password).pipe(
      map(token => {
        localStorage.setItem(localStorageKey, token);
        this.appContext.load();
        return true;
      }),
      catchError(() => of(false)),
    );
  }

  public logout(): void {
    localStorage.removeItem(AuthService.LEGACY_LOCAL_STORAGE_KEY);
    this.appContext.load();
  }

  public isAuthenticated(): boolean {
    return AuthService.getToken() != null;
  }
}
