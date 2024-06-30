import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Observable, of } from "rxjs";
import { isPlatformServer } from "@angular/common";
import { makeStateKey, StateKey, TransferState } from "@angular/platform-browser";
import { tap } from "rxjs/operators";

@Injectable()
export class TransferStateInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) public readonly platformId, public readonly transferState: TransferState) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== "GET") {
      return next.handle(request);
    }

    const key: StateKey<string> = makeStateKey<string>(request.url);

    if (isPlatformServer(this.platformId)) {
      return next.handle(request).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            this.transferState.set(key, (event as HttpResponse<any>).body);
          }
        })
      );
    } else {
      const storedResponse = this.transferState.get<any>(key, null);
      if (storedResponse) {
        const response = new HttpResponse({ body: storedResponse, status: 200 });
        this.transferState.remove(key);
        return of(response);
      } else {
        return next.handle(request);
      }
    }
  }
}
