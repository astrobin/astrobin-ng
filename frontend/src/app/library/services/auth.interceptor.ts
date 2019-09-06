import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = AuthService.getToken();
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Accept": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Token ${authToken}`;
    }

    req = req.clone({
      setHeaders: headers,
    });

    return next.handle(req);
  }
}
