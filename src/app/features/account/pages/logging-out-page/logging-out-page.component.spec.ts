import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { LoggingOutPageComponent } from "./logging-out-page.component";

describe("LoggingOutPageComponent", () => {
  let component: LoggingOutPageComponent;

  beforeEach(() => MockBuilder(LoggingOutPageComponent, AppModule));
  beforeEach(() => (component = MockRender(LoggingOutPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
