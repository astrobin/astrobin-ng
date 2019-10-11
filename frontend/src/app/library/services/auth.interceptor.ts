import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { environment } from "@env/environment";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authToken: string;
    let authScheme: string;

    if (request.url.startsWith(environment.legacyApiUrl)) {
      authToken = AuthService.getLegacyApiToken();
      authScheme = "Token";
    } else if (request.url.startsWith(environment.ngApiUrl)) {
      authToken = AuthService.getNgApiToken();
      authScheme = "jwt";
    }

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Accept": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `${authScheme} ${authToken}`;
    }

    request = request.clone({
      setHeaders: headers,
    });

    return next.handle(request);
  }
}
