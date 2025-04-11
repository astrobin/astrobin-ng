import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockInstance, MockRender, MockReset, MockService } from "ng-mocks";

import { LoggedInPageComponent } from "./logged-in-page.component";

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

  beforeEach(() =>
    MockBuilder(LoggedInPageComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }))
  );
  beforeEach(() => (component = MockRender(LoggedInPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
