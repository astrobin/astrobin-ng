import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, finalize, timeout } from "rxjs/operators";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { isPlatformServer } from "@angular/common";

@Injectable()
export class TimeoutRetryInterceptor implements HttpInterceptor {
  constructor(
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== "GET") {
      return next.handle(req);
    }

    if (isPlatformServer(this.platformId)) {
      return next.handle(req);
    }

    const maxAttempts = 6; // initial attempt + 3 retries
    let loadingNotification: any = null;

    const attemptRequest = (attempt: number): Observable<HttpEvent<any>> => {
      const timeoutMs = 1000 * Math.pow(2, attempt); // 1000, 2000, 4000, 8000, 16000, 32000 ms
      return next.handle(req).pipe(
        timeout(timeoutMs),
        catchError(error => {
          if (attempt < maxAttempts - 1) {
            return attemptRequest(attempt + 1);
          } else {
            if (loadingNotification) {
              this.popNotificationsService.remove(loadingNotification.toastId);
            }
            this.popNotificationsService.error(
              this.translateService.instant(
                "Sorry, we're having trouble performing a network operation. Please try again later.")
            );
            return throwError(error);
          }
        })
      );
    };

    const notificationTimer = setTimeout(() => {
      loadingNotification = this.popNotificationsService.info(
        this.translateService.instant(
          "Just a heads-up: a network operation is taking a bit longer than usual. Thanks for your patience!"
        )
      );
    }, 10000);

    return attemptRequest(0).pipe(
      finalize(() => {
        clearTimeout(notificationTimer);
        if (loadingNotification) {
          this.popNotificationsService.remove(loadingNotification.toastId);
        }
      })
    );
  }
}
