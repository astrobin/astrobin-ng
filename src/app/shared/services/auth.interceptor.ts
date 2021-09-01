import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { State } from "@app/store/state";
import { environment } from "@env/environment";
import { Logout } from "@features/account/store/auth.actions";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    public readonly store$: Store<State>,
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

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json"
    };

    if (authToken) {
      headers["Authorization"] = `${authScheme} ${authToken}`;
    }

    request = request.clone({
      setHeaders: headers
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
