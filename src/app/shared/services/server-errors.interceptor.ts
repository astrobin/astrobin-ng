import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";

import { EMPTY, Observable, of, throwError } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { catchError, retry } from "rxjs/operators";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { AuthService } from "@shared/services/auth.service";
import { WindowRefService } from "@shared/services/window-ref.service";

export class ServerErrorsInterceptor implements HttpInterceptor {
  constructor(
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly authService: AuthService
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let handled = false;

    return next.handle(request).pipe(
      retry(1),
      catchError(returnedError => {
        let errorMessage = null;

        if (returnedError.error instanceof ErrorEvent) {
          errorMessage = `Error: ${returnedError.error.message}`;
        } else if (returnedError instanceof HttpErrorResponse) {
          errorMessage = `Error ${returnedError.status}`;
          if (returnedError.message) {
            errorMessage += `: ${returnedError.message}`;
          } else if (returnedError.error) {
            errorMessage += `: ${returnedError.error.error} - ${returnedError.error.message}`;
          }

          handled = this.handleError(returnedError);
        }

        if (handled) {
          return of(returnedError);
        }

        if (errorMessage) {
          return throwError(errorMessage);
        } else {
          return throwError("Unexpected problem occurred");
        }
      })
    );
  }

  public handleError(err: HttpErrorResponse) {
    let errorTitle: string;
    let errorMessage: string;
    let handled = false;

    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorTitle = this.translateService.instant("An error occurred");
      errorMessage = err.error.message;
    } else {
      // The backend returned an unsuccessful response code.
      switch (err.status) {
        case 400:
          errorTitle = this.translateService.instant("Bad request");
          if (UtilsService.isString(err.error)) {
            errorMessage = err.error;
          } else if (UtilsService.isObject(err.error)) {
            errorMessage = "";
            for (const key of Object.keys(err.error)) {
              errorMessage += `<strong>${key}</strong>: ${err.error[key]}<br/>`;
            }
          }
          break;
        case 401:
          errorTitle = this.translateService.instant("Login required");
          errorMessage = this.translateService.instant(
            "You tried to access a server resource that's only available to logged in users."
          );

          // Force logout in case of invalid authentication token.
          this.authService.logout();
          setTimeout(() => {
            this.windowRefService.nativeWindow.location.assign("/account/login");
          }, 3000);

          break;
        case 403:
          errorTitle = this.translateService.instant("Permission denied");
          errorMessage = this.translateService.instant(
            "You tried to access a server resource that you're not authorized for."
          );
          break;
        case 404:
          errorTitle = this.translateService.instant("The requested resource does not exist");
          errorMessage = err.url;
          break;
        case 409:
          errorTitle = this.translateService.instant("Conflict detected");
          errorMessage = err.url;
          break;
        case 500:
          errorTitle = this.translateService.instant("Internal server error");
          errorMessage = this.translateService.instant(
            "This should never happen. AstroBin's staff has been notified automatically and will solve the " +
              "problem as soon as possible."
          );
          break;
        case 503:
          errorTitle = this.translateService.instant("Service not available");
          errorMessage = this.translateService.instant(
            "This should never happen. If the problem persists, please contact us."
          );
          break;
        case 422:
          errorTitle = this.translateService.instant("Validation error");
          errorMessage = err.error;
          break;
        default:
          errorTitle = this.translateService.instant("Something went wrong");
          errorMessage = this.translateService.instant("If you can reproduce this issue reliably, please contact us.");
      }
    }

    if (errorTitle && errorMessage) {
      this.popNotificationsService.error(errorMessage, errorTitle, {
        disableTimeOut: true,
        enableHtml: true
      });

      this.loadingService.setLoading(false);

      handled = true;
    }

    return handled;
  }
}
