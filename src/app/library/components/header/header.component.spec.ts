import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { LanguageLoader } from "@app/translate-loader";
import { FontAwesomeTestingModule } from "@fortawesome/angular-fontawesome/testing";
import { UserProfileGenerator } from "@lib/generators/user-profile.generator";
import { PipesModule } from "@lib/pipes/pipes.module";
import { AppContextInterface, AppContextService } from "@lib/services/app-context.service";
import { SharedModule } from "@lib/shared.module";
import { NgbCollapseModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { HeaderComponent } from "./header.component";

class MockAppContextService {
  get = jest.fn(
    () =>
      new Observable<AppContextInterface>(observer => {
        observer.next({
          currentUserProfile: UserProfileGenerator.userProfile()
        } as AppContextInterface);
      })
  );
}

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FontAwesomeTestingModule,
        NgbCollapseModule,
        NgbTooltipModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: LanguageLoader,
            deps: [HttpClient]
          }
        }),
        SharedModule,
        PipesModule
      ],
      providers: [
        { provide: AppContextService, useClass: MockAppContextService }
      ],
      declarations: [HeaderComponent]
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

  describe("openLoginModal", () => {
    it("should defer to modalService", () => {
      spyOn(component.modalService, "open");
      const mockEvent = {
        preventDefault: jest.fn()
      };

      component.openLoginModal(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.modalService.open).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should defer to authService", () => {
      spyOn(component.authService, "logout");
      const mockEvent = {
        preventDefault: jest.fn()
      };

      component.logout(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.authService.logout).toHaveBeenCalled();
    });
  });
});
