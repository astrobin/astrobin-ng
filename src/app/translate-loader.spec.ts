import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { LanguageLoader } from "@app/translate-loader";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

describe("LanguageLoader", () => {
  let languageLoader: LanguageLoader;

  beforeEach(async () => {
    await MockBuilder(LanguageLoader, AppModule);
    languageLoader = TestBed.inject(LanguageLoader);
  });

  describe("getTranslations", () => {
    it("should work under best conditions", done => {
      const ng = {
        c: "C",
        d: "D"
      };

      languageLoader.ngTranslations$ = () => of(ng);

      languageLoader.getTranslation("en").subscribe(translation => {
        expect(translation).toEqual(ng);
        done();
      });
    });
  });
});
