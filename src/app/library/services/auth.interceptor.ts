import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let authToken: string;
    let authScheme: string;

    if (request.url.startsWith(environment.classicApiUrl)) {
      authToken = AuthService.getClassicApiToken();
      authScheme = "Token";
    }

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json"
    };

    if (authToken) {
      headers["Authorization"] = `${authScheme} ${authToken}`;
    }

    request = request.clone({
      setHeaders: headers
    });

    return next.handle(request);
  }
}
