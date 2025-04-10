import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { TransferState } from "@angular/platform-browser";
import { CLIENT_IP, CLIENT_IP_KEY } from "@app/client-ip.injector";
import { Observable } from "rxjs";

declare let global: any;

@Injectable()
export class ClientIpInterceptor implements HttpInterceptor {
  constructor(public readonly transferState: TransferState, @Inject(CLIENT_IP) public readonly clientIp: string) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let clientIp: string | null;

    if (typeof global !== "undefined") {
      clientIp = global["clientIp"];
    } else {
      clientIp = this.transferState.get(CLIENT_IP_KEY, null);
    }

    if (!!clientIp) {
      request = request.clone({
        setHeaders: {
          "X-Forwarded-For": clientIp
        }
      });
    }
    return next.handle(request);
  }
}
