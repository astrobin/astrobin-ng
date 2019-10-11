import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { AppComponent } from "@app/app.component";
import { appInitializer } from "@app/app.module";
import { LibraryModule } from "@lib/library.module";
import { AppContextService } from "@lib/services/app-context.service";
import { SharedModule } from "@lib/shared.module";
import { LanguageLoader } from "@app/translate-loader";
import { CommonLegacyApiService } from "@lib/services/api/legacy/common-legacy-api.service";
import { CommonLegacyApiServiceMock } from "@lib/services/api/legacy/common-legacy-api.service-mock";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("AppComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LibraryModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: LanguageLoader,
            deps: [HttpClient],
          },
        }),
        SharedModule,
      ],
      providers: [
        AppContextService,
        {
          provide: CommonLegacyApiService, useClass: CommonLegacyApiServiceMock,
        },
        {
          provide: APP_INITIALIZER,
          useFactory: appInitializer,
          multi: true,
          deps: [
            AppContextService,
          ],
        },
      ],
      declarations: [
        AppComponent,
      ],
    }).compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
