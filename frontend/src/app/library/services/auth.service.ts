import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthClassicApiService } from "./api/classic/auth-classic-api.service";
import { AppContextService } from "./app-context.service";

export enum AuthServiceType {
  // Classic Auth = against the regular Django AstroBin service.
  CLASSIC,
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  static CLASSIC_LOCAL_STORAGE_KEY = "classic-auth-token";

  constructor(
    public readonly authClassicApi: AuthClassicApiService,
    public readonly appContext: AppContextService) {
  }

  public static getClassicApiToken(): string {
    return localStorage.getItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY);
  }

  public login(handle: string, password: string): Observable<boolean> {
    return this.authClassicApi.login(handle, password).pipe(
      map(token => {
        localStorage.setItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY, token);
        this.appContext.load();
        return true;
      }),
      catchError(() => of(false)),
    );
  }

  public logout(): void {
    localStorage.removeItem(AuthService.CLASSIC_LOCAL_STORAGE_KEY);
    this.appContext.load();
  }

  public isAuthenticated(): boolean {
    return AuthService.getClassicApiToken() != null;
  }
}
