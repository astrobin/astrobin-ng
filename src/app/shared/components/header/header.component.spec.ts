import { AppModule } from "@app/app.module";
import { AppGenerator } from "@app/store/generators/app.generator";
import { State } from "@app/store/state";
import { AuthGenerator } from "@features/account/store/auth.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";
import { HeaderComponent } from "./header.component";

describe("HeaderComponent", () => {
  let component: HeaderComponent;
  const initialState: State = {
    app: AppGenerator.default(),
    auth: AuthGenerator.default()
  };

  beforeEach(() => MockBuilder(HeaderComponent, AppModule).provide(provideMockStore({ initialState })));

  beforeEach(() => {
    component = MockRender(HeaderComponent).point.componentInstance;
    component.translateService.currentLang = "en";
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
    it("should defer to a store$ event", () => {
      const mockEvent = {
        preventDefault: jest.fn()
      };

      jest.spyOn(component.store$, "dispatch");

      component.logout(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.store$.dispatch).toHaveBeenCalled();
    });
  });
});
