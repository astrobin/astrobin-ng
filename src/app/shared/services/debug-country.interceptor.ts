import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";

@Injectable()
export class DebugCountryInterceptor implements HttpInterceptor {
  constructor(public readonly windowRefService: WindowRefService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const debugCountry: string | null = UtilsService.getUrlParam(
      this.windowRefService.getCurrentUrl().search,
      "debug-country"
    );

    if (!request.url.startsWith(environment.classicApiUrl) || !debugCountry) {
      return next.handle(request);
    }

    const requestUrl = UtilsService.addOrUpdateUrlParam(request.url, "DEBUG_COUNTRY", debugCountry);
    const clonedRequest = request.clone({ url: requestUrl });
    return next.handle(clonedRequest);
  }
}
