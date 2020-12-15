import { ReactiveFormsModule } from "@angular/forms";
import { ComponentsModule } from "@shared/components/components.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { of } from "rxjs";
import { LoginFormComponent } from "./login-form.component";

describe("LoginFormComponent", () => {
  let component: LoginFormComponent;

  beforeEach(() => MockBuilder(LoginFormComponent, ComponentsModule).keep(ReactiveFormsModule));
  beforeEach(() => (component = MockRender(LoginFormComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("login", () => {
    it("should unset error on success", () => {
      spyOn(component.authService, "login").and.returnValue(of(true));

      component.login();

      expect(component.error).toBe(false);
    });

    it("should unset error on failure", () => {
      spyOn(component.authService, "login").and.returnValue(of(false));

      component.login();

      expect(component.error).toBe(true);
    });
  });
});
