import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authToken: string;

    if (request.url.startsWith(environment.legacyApiUrl)) {
      authToken = AuthService.getLegacyApiToken();
    } else if (request.url.startsWith(environment.ngApiUrl)) {
      authToken = AuthService.getNgApiToken();
    }

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Accept": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Token ${authToken}`;
    }

    request = request.clone({
      setHeaders: headers,
    });

    return next.handle(request);
  }
}
