import { ReactiveFormsModule } from "@angular/forms";
import { ComponentsModule } from "@shared/components/components.module";
import { MockBuilder, MockRender } from "ng-mocks";
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
      component.login();

      expect(component.error).toBe(false);
    });

    it("should unset error on failure", () => {
      component.login();

      expect(component.error).toBe(true);
    });
  });
});
