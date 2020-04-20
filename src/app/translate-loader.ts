import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslatePoHttpLoader } from "@fjnr/ngx-translate-po-http-loader";
import { environment } from "@env/environment";
import { TranslateLoader } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class LanguageLoader extends TranslatePoHttpLoader implements TranslateLoader {
  constructor(
    protected _http: HttpClient,
    protected _prefix: string = "/json-api/i18n/messages",
    protected _suffix: string = ""
  ) {
    super(_http, _prefix, _suffix);
  }

  getTranslation(lang: string): Observable<any> {
    return this._http
      .get(`${environment.classicApiUrl}${this._prefix}/${lang}`, { responseType: "text" })
      .pipe(map((contents: string) => this.parse(contents)));
  }
}
