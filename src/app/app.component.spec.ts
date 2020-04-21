import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { APP_INITIALIZER } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "@app/app.component";
import { appInitializer } from "@app/app.module";
import { LanguageLoader } from "@app/translate-loader";
import { LibraryModule } from "@lib/library.module";
import { CommonApiService } from "@lib/services/api/classic/common/common-api.service";
import { CommonApiServiceMock } from "@lib/services/api/classic/common/common-api.service-mock";
import { AppContextService } from "@lib/services/app-context.service";
import { WindowRefService } from "@lib/services/window-ref.service";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";

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
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        AppContextService,
        {
          provide: CommonApiService,
          useClass: CommonApiServiceMock
        },
        {
          provide: APP_INITIALIZER,
          useFactory: appInitializer,
          multi: true,
          deps: [AppContextService]
        },
        WindowRefService
      ],
      declarations: [AppComponent]
    }).compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
