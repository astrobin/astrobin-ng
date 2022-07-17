import { AppModule } from "@app/app.module";
import { MockBuilder, MockInstance, MockRender, MockService } from "ng-mocks";
import { LoggingInPageComponent } from "./logging-in-page.component";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("LoggingInPageComponent", () => {
  let component: LoggingInPageComponent;

  beforeEach(() => MockBuilder(LoggingInPageComponent, AppModule).provide(provideMockStore({ initialState })));

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
