import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { TranslatePoHttpLoader } from "@fjnr/ngx-translate-po-http-loader";
import { TranslateLoader } from "@ngx-translate/core";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

declare const VERSION: string;

@Injectable()
export class LanguageLoader extends TranslatePoHttpLoader implements TranslateLoader {
  constructor(protected _http: HttpClient, private _jsonApi: JsonApiService) {
    super(_http);
  }

  getTranslation(lang: string): Observable<any> {
    return forkJoin([
      this._classicTranslations$(lang),
      this._ngTranslations$(lang).pipe(catchError(() => of(null)))
    ]).pipe(
      map(results => {
        return {
          ...results[0],
          ...results[1]
        };
      })
    );
  }

  parse(contents: string): any {
    const translations = super.parse(contents);
    const mapped = {};

    Object.keys(translations).forEach(key => {
      const regex = /%\((.*?)\)s/g;
      const replacement = "{{$1}}";
      mapped[key.replace(regex, replacement)] = translations[key].replace(regex, replacement);
    });

    return mapped;
  }

  private _classicTranslations$ = (lang: string) =>
    this._jsonApi.getBackendConfig().pipe(
      switchMap(backendConfig =>
        this._http
          .get(`${environment.classicApiUrl}/json-api/i18n/messages/${lang}/?version=${backendConfig.version}`, {
            responseType: "text"
          })
          .pipe(map((contents: string) => this.parse(contents)))
      )
    );

  private _ngTranslations$ = (lang: string) => this._http.get(`/assets/i18n/${lang}.json?version=${VERSION}`);
}
