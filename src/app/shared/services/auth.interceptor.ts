import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { CookieService } from "ngx-cookie-service";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    public popNotificationsService: PopNotificationsService,
    public authService: AuthService,
    public translate: TranslateService,
    public cookieService: CookieService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authToken: string;
    let authScheme: string;
    let csrfToken: string;

    if (request.url.startsWith(environment.classicApiUrl)) {
      authToken = this.authService.getClassicApiToken();
      authScheme = "Token";

      csrfToken = this.cookieService.get("csrftoken");
    }

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json"
    };

    if (authToken) {
      headers["Authorization"] = `${authScheme} ${authToken}`;
    }

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    request = request.clone({
      setHeaders: headers,
      withCredentials: true
    });

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.authService.logout();
          this.popNotificationsService.warning(this.translate.instant("Your session is invalid, please log in again"));
        }

        return throwError(error);
      })
    );
  }
}
