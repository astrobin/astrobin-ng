import { LoggedOutPageComponent } from "./logged-out-page.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("LoggedOutPageComponent", () => {
  let component: LoggedOutPageComponent;

  beforeEach(() => MockBuilder(LoggedOutPageComponent, AppModule));
  beforeEach(() => (component = MockRender(LoggedOutPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
