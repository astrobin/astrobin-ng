import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { TranslatePoHttpLoader } from "@fjnr/ngx-translate-po-http-loader";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { forkJoin, Observable } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

declare const VERSION: string;

@Injectable()
export class LanguageLoader extends TranslatePoHttpLoader {
  constructor(public http: HttpClient, public jsonApi: JsonApiService) {
    super(http);
  }

  ngJsonTranslations$ = (lang: string): Observable<object> =>
    this.http.get(`/assets/i18n/${lang}.json?version=${VERSION}`);

  ngTranslations$ = (lang: string): Observable<object> =>
    this.http
      .get(`/assets/i18n/${lang}.po?version=${VERSION}`, {
        responseType: "text"
      })
      .pipe(map((contents: string) => this.parse(contents)));

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

  getTranslation(lang: string): Observable<any> {
    return forkJoin([
      this.classicTranslations$(lang),
      this.ngJsonTranslations$(lang).pipe(catchError(() => this.ngJsonTranslations$("en"))),
      this.ngTranslations$(lang).pipe(catchError(() => this.ngTranslations$("en")))
    ]).pipe(
      map(results => {
        const classicTranslations = results[0];
        const ngJsonTranslations = results[1];
        const ngTranslations = results[2];

        Object.keys(classicTranslations).forEach(key => {
          if (classicTranslations[key] === "") {
            classicTranslations[key] = key;
          }
        });

        Object.keys(ngJsonTranslations).forEach(key => {
          if (ngJsonTranslations[key] === "") {
            ngJsonTranslations[key] = key;
          }
        });

        Object.keys(ngTranslations).forEach(key => {
          if (ngTranslations[key] === "") {
            ngTranslations[key] = ngJsonTranslations[key];
          }
        });

        return {
          ...ngJsonTranslations,
          ...ngTranslations,
          ...classicTranslations
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
