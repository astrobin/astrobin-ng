import { UsernameComponent } from "./username.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("UsernameComponent", () => {
  let component: UsernameComponent;

  beforeEach(() => MockBuilder(UsernameComponent, AppModule));
  beforeEach(() => (component = MockRender(UsernameComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
