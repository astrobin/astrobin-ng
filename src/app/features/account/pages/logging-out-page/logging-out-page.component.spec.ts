import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { LoggingOutPageComponent } from "./logging-out-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("LoggingOutPageComponent", () => {
  let component: LoggingOutPageComponent;

  beforeEach(() => MockBuilder(LoggingOutPageComponent, AppModule).provide(provideMockStore({ initialState: initialMainState })));
  beforeEach(() => (component = MockRender(LoggingOutPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
