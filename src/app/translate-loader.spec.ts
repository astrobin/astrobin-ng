import { HttpClient } from "@angular/common/http";
import { TestBed, waitForAsync } from "@angular/core/testing";
import { CustomMissingTranslationHandler } from "@app/missing-translation-handler";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { LanguageLoader } from "@app/translate-loader";
import { CustomTranslateParser } from "@app/translate-parser";
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateParser } from "@ngx-translate/core";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { of } from "rxjs";

declare var VERSION: string;

describe("LanguageLoader", () => {
  let languageLoader: LanguageLoader;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          ...testAppImports,
          TranslateModule.forRoot({
            missingTranslationHandler: {
              provide: MissingTranslationHandler,
              useClass: CustomMissingTranslationHandler
            },
            parser: {
              provide: TranslateParser,
              useClass: CustomTranslateParser
            },
            loader: {
              provide: TranslateLoader,
              useClass: LanguageLoader,
              deps: [HttpClient, JsonApiService]
            }
          })
        ],
        providers: [...testAppProviders, LanguageLoader]
      }).compileComponents();

      (global as any).VERSION = "1";
      languageLoader = TestBed.inject(LanguageLoader);
    })
  );

  describe("getTranslations", () => {
    it("should work under best conditions", done => {
      const classic = {
        a: "A",
        b: "B"
      };

      const ng = {
        c: "C",
        d: "D"
      };

      languageLoader.classicTranslations$ = () => of(classic);
      languageLoader.ngJsonTranslations$ = () => of(ng);
      languageLoader.ngTranslations$ = () => of(ng);

      languageLoader.getTranslation("en").subscribe(translation => {
        expect(translation).toEqual({ ...classic, ...ng });
        done();
      });
    });

    it("should fill missing values with key", done => {
      const classic = {
        a: "A",
        b: ""
      };

      const ng = {
        c: "C",
        d: ""
      };

      languageLoader.classicTranslations$ = () => of(classic);
      languageLoader.ngJsonTranslations$ = () => of(ng);
      languageLoader.ngTranslations$ = () => of(ng);

      languageLoader.getTranslation("en").subscribe(translation => {
        expect(translation).toEqual({
          a: "A",
          b: "b",
          c: "C",
          d: "d"
        });
        done();
      });
    });
  });
});
