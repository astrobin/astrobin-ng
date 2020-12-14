import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { HeaderComponent } from "./header.component";

describe("HeaderComponent", () => {
  let component: HeaderComponent;

  beforeEach(() => MockBuilder(HeaderComponent, AppModule));
  beforeEach(() => (component = MockRender(HeaderComponent).point.componentInstance));

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
