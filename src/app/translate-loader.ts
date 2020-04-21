import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { TranslatePoHttpLoader } from "@fjnr/ngx-translate-po-http-loader";
import { AppContextService } from "@lib/services/app-context.service";
import { TranslateLoader } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class LanguageLoader extends TranslatePoHttpLoader implements TranslateLoader {
  constructor(
    private _appContext: AppContextService,
    protected _http: HttpClient,
    protected _prefix: string = "/json-api/i18n/messages",
    protected _suffix: string = ""
  ) {
    super(_http, _prefix, _suffix);
  }

  getTranslation(lang: string): Observable<any> {
    return this._appContext.get().pipe(
      switchMap(appContext =>
        this._http
          .get(`${environment.classicApiUrl}${this._prefix}/${lang}/?version=${appContext.backendConfig.version}`, {
            responseType: "text"
          })
          .pipe(map((contents: string) => this.parse(contents)))
      )
    );
  }
}
