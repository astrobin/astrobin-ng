import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry, timeout } from "rxjs/operators";

@Injectable()
export class TimeoutRetryInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes("/api/v2/images/image")) {
      return next.handle(req);
    }

    if (req.method !== "GET") {
      return next.handle(req);
    }

    return next.handle(req)
      .pipe(
        timeout(5000), // 5 seconds timeout
        retry(3), // Retry up to 3 times before failing
        catchError(error => {
          // Handle the error here
          return throwError(error);
        })
      );
  }
}
