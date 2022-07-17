import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { MockBuilder, MockInstance, MockRender, MockReset, MockService } from "ng-mocks";
import { LoggedInPageComponent } from "./logged-in-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("LoggedInPageComponent", () => {
  let component: LoggedInPageComponent;

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

  beforeEach(() => MockBuilder(LoggedInPageComponent, AppModule).provide(provideMockStore({ initialState })));
  beforeEach(() => (component = MockRender(LoggedInPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
