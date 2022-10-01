import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";

import { Observable, of } from "rxjs";
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
    public readonly authService: AuthService,
    public readonly utilsService: UtilsService
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(1),
      catchError(returnedError => {
        if (this.handleError(returnedError)) {
          return of(returnedError);
        }

        return next.handle(request);
      })
    );
  }

  public handleError(err: HttpErrorResponse) {
    let errorTitle: string;
    let errorMessage: string;
    let handled = false;

    const ignored404Paths = [/.*\/api\/v2\/equipment\/\w+\/\d+\/release-reviewer-lock\/$/];

    // The backend returned an unsuccessful response code.
    switch (err.status) {
      case 400:
        errorTitle = this.translateService.instant("Bad request");

        if (UtilsService.isString(err.error)) {
          errorMessage = err.error;
        } else if (Array.isArray(err.error)) {
          errorMessage = "";
          for (const error of err.error) {
            errorMessage += `${error}<br/>`;
          }
        } else if (UtilsService.isObject(err.error)) {
          errorMessage = "";
          for (const key of Object.keys(err.error)) {
            errorMessage += `<strong>${key}</strong>: ${err.error[key]}<br/>`;
          }
        }

        if (errorMessage.indexOf("AstroBin stands with Ukraine") > -1) {
          this.windowRefService.nativeWindow.location.assign(
            "https://welcome.astrobin.com/astrobin-stands-with-ukraine"
          );
        }

        break;
      case 401:
        errorTitle = this.translateService.instant("Login required");
        errorMessage = this.translateService.instant(
          "You tried to access a server resource that's only available to logged in users."
        );

        // Force logout in case of invalid authentication token.
        this.authService.logout();
        this.utilsService.delay(3000).subscribe(() => {
          this.windowRefService.nativeWindow.location.assign("/account/login");
        });

        break;
      case 403:
        errorTitle = this.translateService.instant("Permission denied");
        errorMessage =
          err.error ||
          this.translateService.instant("You tried to access a server resource that you're not authorized for.");
        break;
      case 404:
        let ignore = false;
        for (const ignoredPathRegex of ignored404Paths) {
          if (ignoredPathRegex.test(err.url)) {
            ignore = true;
          }
        }

        if (!ignore) {
          errorTitle = this.translateService.instant("The requested resource does not exist");
          errorMessage = err.url;
        }

        break;
      case 409:
        errorTitle = this.translateService.instant("Conflict detected");
        errorMessage = err.error || err.url;
        break;
      case 429:
        errorTitle = this.translateService.instant("Too many requests");
        errorMessage =
          this.translateService.instant(
            "You're trying to do this operation too many times in a short period of time."
          ) +
          " " +
          this.translateService.instant("For security reasons, this is not permitted.");
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
        errorTitle = this.translateService.instant("Something went wrong") + ` (error ${err.status})`;
        errorMessage =
          this.translateService.instant("If you can reproduce this issue reliably, please contact us.") +
          ` (error: ${err.message}`;
    }

    if (errorTitle && errorMessage) {
      this.popNotificationsService.error(errorMessage, errorTitle, {
        timeOut: 60000,
        disableTimeOut: "extendedTimeOut",
        enableHtml: true,
        closeButton: true
      });

      this.loadingService.setLoading(false);

      handled = true;
    }

    return handled;
  }
}
