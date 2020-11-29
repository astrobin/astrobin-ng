import {AppModule} from "@app/app.module";
import {ComponentsModule} from "@shared/components/components.module";
import {UserProfileGenerator} from "@shared/generators/user-profile.generator";
import {AppContextInterface, AppContextService} from "@shared/services/app-context/app-context.service";
import {MockBuilder, MockRender} from "ng-mocks";
import {Observable} from "rxjs";
import {HeaderComponent} from "./header.component";

class MockAppContextService {
  context$ = new Observable<AppContextInterface>(observer => {
    observer.next({
      currentUserProfile: UserProfileGenerator.userProfile()
    } as AppContextInterface);
  });
}

describe("HeaderComponent", () => {
  let component: HeaderComponent;

  beforeEach(() =>
    MockBuilder(HeaderComponent, ComponentsModule)
      .mock(AppModule)
      .provide({
        provide: AppContextService,
        useClass: MockAppContextService,
      })
  );

  beforeEach(() => {
    const fixture = MockRender(HeaderComponent);
    component = fixture.point.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("openLoginModal", () => {
    it("should defer to modalService", () => {
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
      const mockEvent = {
        preventDefault: jest.fn()
      };

      component.logout(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.authService.logout).toHaveBeenCalled();
    });
  });
});
