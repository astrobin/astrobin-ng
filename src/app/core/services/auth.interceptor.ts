import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MainState } from "@app/store/state";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { environment } from "@env/environment";
import { Logout } from "@features/account/store/auth.actions";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly authService: AuthService,
    public readonly translate: TranslateService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authToken: string;
    let authScheme: string;

    if (request.url.startsWith(environment.classicApiUrl)) {
      authToken = this.authService.getClassicApiToken();
      authScheme = "Token";
    }

    const headers = {};

    // Copy original headers.
    for (const key of request.headers.keys()) {
      headers[key] = request.headers.get(key);
    }

    // Set some default if missing.
    for (const setIfMissing of [
      {
        key: "Content-Type",
        value: "application/json; charset=utf-8"
      },
      {
        key: "Accept",
        value: "application/json"
      }
    ]) {
      if (!headers[setIfMissing.key]) {
        headers[setIfMissing.key] = setIfMissing.value;
      } else if (headers[setIfMissing.key] === "__unset__") {
        delete headers[setIfMissing.key];
      }
    }

    // Set the Authorization header.
    if (authToken) {
      headers["Authorization"] = `${authScheme} ${authToken}`;
    }

    request = request.clone({
      headers: new HttpHeaders(headers)
    });

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.store$.dispatch(new Logout());

          const invalidSessionMessage = this.translate.instant("Your session is invalid, please log in again");
          const login = this.translate.instant("Log in");
          const openLink = `<a href="/account/login" class="d-inline-block mt-3 btn btn-primary">`;
          const closeLink = `</a>`;
          const message = `${invalidSessionMessage}<br/>${openLink}${login}${closeLink}`;
          this.popNotificationsService.warning(message, null, { enableHtml: true, disableTimeOut: true });
        }

        return throwError(error);
      })
    );
  }
}
