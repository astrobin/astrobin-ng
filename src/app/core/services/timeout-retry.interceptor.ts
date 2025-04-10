import { isPlatformServer } from "@angular/common";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { Observable, throwError, timer } from "rxjs";
import { catchError, finalize, mergeMap, timeout } from "rxjs/operators";

import { HttpRetryService } from "./http-retry.service";

@Injectable()
export class TimeoutRetryInterceptor implements HttpInterceptor {
  constructor(
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    private httpRetryService: HttpRetryService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== "GET") {
      return next.handle(req);
    }

    if (isPlatformServer(this.platformId)) {
      return next.handle(req);
    }

    // Skip retry for service worker control requests
    if (req.url && /.*\/json-api\/common\/service-worker-control\/$/.test(req.url)) {
      return next.handle(req);
    }

    const maxAttempts = 4; // initial attempt + 3 retries (3500, 7000, 14000, 28000 ms)

    const attemptRequest = (attempt: number): Observable<HttpEvent<any>> => {
      const timeoutMs = 3500 * Math.pow(2, attempt); // 3500, 7000, 14000, 28000 ms

      if (attempt === 0 && req.url) {
        // Initialize retry tracking for this URL
        this.httpRetryService.startRetrying(req.url, maxAttempts - 1);
      } else if (req.url) {
        // Update current attempt counter
        this.httpRetryService.incrementRetryAttempt(req.url);
      }

      return next.handle(req).pipe(
        timeout(timeoutMs),
        catchError(error => {
          const isNetworkError = error instanceof HttpErrorResponse && error.status === 0;
          const isTimeoutError = error.name === "TimeoutError";

          if (isNetworkError || isTimeoutError) {
            if (attempt < maxAttempts - 1) {
              const retryDelay = 1000 * Math.pow(2, attempt); // Exponential backoff for retry
              const errorType = isTimeoutError ? "Timeout" : "Network error";
              console.log(
                `${errorType}. Timeout was ${timeoutMs}ms. Retrying in ${retryDelay}ms, attempt ${attempt + 1} of ` +
                  `${maxAttempts - 1}`
              );

              return timer(retryDelay).pipe(mergeMap(() => attemptRequest(attempt + 1)));
            }
          }

          // Final attempt or non-network error
          if (req.url) {
            this.httpRetryService.finishRetrying(req.url);
          }

          return throwError(error);
        }),
        finalize(() => {
          // Ensure we clean up tracking state for successful requests
          if (req.url) {
            this.httpRetryService.finishRetrying(req.url);
          }
        })
      );
    };

    return attemptRequest(0);
  }
}
