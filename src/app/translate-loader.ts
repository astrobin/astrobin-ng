import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { TranslatePoHttpLoader } from "@fjnr/ngx-translate-po-http-loader";
import { TranslateLoader } from "@ngx-translate/core";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { forkJoin, Observable } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

declare const VERSION: string;

@Injectable()
export class LanguageLoader extends TranslatePoHttpLoader implements TranslateLoader {
  ngTranslations$ = (lang: string): Observable<object> => this.http.get(`/assets/i18n/${lang}.json?version=${VERSION}`);

  classicTranslations$ = (lang: string): Observable<object> =>
    this.jsonApi.getBackendConfig$().pipe(
      switchMap(backendConfig =>
        this.http
          .get(`${environment.classicApiUrl}/json-api/i18n/messages/${lang}/?version=${backendConfig.i18nHash}`, {
            responseType: "text"
          })
          .pipe(map((contents: string) => this.parse(contents)))
      )
    );

  constructor(public http: HttpClient, public jsonApi: JsonApiService) {
    super(http);
  }

  getTranslation(lang: string): Observable<any> {
    return forkJoin([
      this.classicTranslations$(lang),
      this.ngTranslations$(lang).pipe(catchError(() => this.ngTranslations$("en")))
    ]).pipe(
      map(results => {
        const classicTranslations = results[0];
        const ngTranslations = results[1];

        Object.keys(classicTranslations).forEach(key => {
          if (classicTranslations[key] === "") {
            classicTranslations[key] = key;
          }
        });

        Object.keys(ngTranslations).forEach(key => {
          if (ngTranslations[key] === "") {
            ngTranslations[key] = key;
          }
        });

        return {
          ...classicTranslations,
          ...ngTranslations
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
}
