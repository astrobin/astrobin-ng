import { APP_INITIALIZER } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { AppComponent } from "@app/app.component";
import { testAppImports } from "@app/test-app.imports";
import { FooterComponent } from "@shared/components/footer/footer.component";
import { HeaderComponent } from "@shared/components/header/header.component";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { CommonApiServiceMock } from "@shared/services/api/classic/common/common-api.service-mock";
import { AppContextService } from "@shared/services/app-context.service";
import { AuthService } from "@shared/services/auth.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { appInitializer } from "@shared/shared.module";
import { MockComponents } from "ng-mocks";
import { TimeagoIntl } from "ngx-timeago";

describe("AppComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
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
          deps: [AppContextService, AuthService]
        },
        TimeagoIntl,
        WindowRefService
      ],
      declarations: [AppComponent, MockComponents(HeaderComponent, FooterComponent)]
    }).compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
