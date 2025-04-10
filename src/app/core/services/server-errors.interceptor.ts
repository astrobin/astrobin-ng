import type { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import type { AuthService } from "@core/services/auth.service";
import type { HttpRetryService } from "@core/services/http-retry.service";
import type { LoadingService } from "@core/services/loading.service";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import type { TranslateService } from "@ngx-translate/core";
import type { Observable } from "rxjs";
import { throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";

export class ServerErrorsInterceptor implements HttpInterceptor {
  constructor(
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly authService: AuthService,
    public readonly utilsService: UtilsService,
    private httpRetryService: HttpRetryService
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if running in a browser environment
    if (typeof window === "undefined") {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      retry(1),
      catchError(returnedError => {
        if (this.handleError(returnedError)) {
          return throwError(returnedError);
        }

        return next.handle(request);
      })
    );
  }

  public handleError(err: HttpErrorResponse) {
    // For status 0 errors, check if it's being handled by TimeoutRetryInterceptor
    if (err.status === 0 && err.url && this.httpRetryService.isRetryInProgress(err.url)) {
      return false;
    }

    let errorTitle: string;
    let errorMessage: string;
    let handled = false;

    const ignored404Paths = [
      /.*\/api\/v2\/equipment\/\w+\/\d+\/release-reviewer-lock\/$/,
      /.*\/json-api\/common\/ckeditor-upload\/*/,
      /.*\/api\/v2\/images\/image-search\/\?params=.*/
    ];

    const ignoredAnyErrorPaths = [
      /.*\/json-api\/common\/service-worker-control\/$/,
      /.*\/json-api\/common\/record-hit\/*/
    ];

    if (ignoredAnyErrorPaths.some(regex => regex.test(err.url))) {
      return false;
    }

    // The backend returned an unsuccessful response code.
    switch (err.status) {
      case 0:
        errorTitle = this.translateService.instant("Connection error");
        errorMessage = this.translateService.instant(
          "Could not connect to the server. Please check your internet connection and try again."
        );
        break;
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

        if (!!errorMessage && errorMessage.indexOf("AstroBin stands with Ukraine") > -1) {
          this.windowRefService.nativeWindow.location.assign(
            "https://welcome.astrobin.com/astrobin-stands-with-ukraine"
          );
        }

        break;
      case 401:
        if (err.error?.detail === "Invalid token.") {
          errorTitle = this.translateService.instant("Invalid token");
          errorMessage = this.translateService.instant(
            "The authentication token you provided is invalid. Please log in again."
          );
          this.authService.removeAuthenticationToken();
          this.windowRefService.nativeWindow.document.location.reload();
        } else {
          errorTitle = this.translateService.instant("Login required");
          errorMessage = this.translateService.instant(
            "You tried to access a server resource that's only available to logged in users."
          );

          // Force logout in case of invalid authentication token.
          this.authService.logout();
          this.utilsService.delay(3000).subscribe(() => {
            this.windowRefService.nativeWindow.location.assign("/account/login");
          });
        }

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
