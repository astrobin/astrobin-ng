import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbCollapseModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { LanguageLoader } from "@app/translate-loader";
import { PipesModule } from "@lib/pipes/pipes.module";
import { AppContextService, IAppContext } from "@lib/services/app-context.service";
import { SharedModule } from "@lib/shared.module";
import { HeaderComponent } from "./header.component";
import { Observable } from "rxjs";
import { UserProfileModel } from "@lib/models/common/userprofile.model";
import { UserModel } from "@lib/models/common/user.model";

class MockAppContextService {
  get = jest.fn(
    () => new Observable<IAppContext>(observer => {
      observer.next({
        currentUserProfile: new UserProfileModel({
            userObject: new UserModel({}),
          },
        ),
      } as IAppContext);
    }));
}

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgbCollapseModule,
        NgbTooltipModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: LanguageLoader,
            deps: [HttpClient],
          },
        }),
        SharedModule,
        PipesModule,
      ],
      providers: [
        { provide: AppContextService, useClass: MockAppContextService },
      ],
      declarations: [HeaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
