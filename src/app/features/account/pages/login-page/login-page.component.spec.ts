import { LoginPageComponent } from "./login-page.component";
import { MockBuilder, MockInstance, MockRender, MockReset, MockService } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap } from "@angular/router";

describe("LoginPageComponent", () => {
  let component: LoginPageComponent;

  beforeEach(() =>
    MockInstance(ActivatedRoute, () => ({
      snapshot: MockService(ActivatedRouteSnapshot, {
        queryParamMap: {
          has: jest.fn(),
          get: jest.fn(),
          getAll: jest.fn(),
          keys: []
        }
      })
    }))
  );

  afterEach(MockReset);

  beforeEach(() => MockBuilder(LoginPageComponent, AppModule));
  beforeEach(() => (component = MockRender(LoginPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
