import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockInstance, MockRender, MockService } from "ng-mocks";

import { LoggingInPageComponent } from "./logging-in-page.component";

describe("LoggingInPageComponent", () => {
  let component: LoggingInPageComponent;

  beforeEach(() =>
    MockBuilder(LoggingInPageComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }))
  );

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

  beforeEach(() => (component = MockRender(LoggingInPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
