import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { UsernameComponent } from "./username.component";
import { UserGenerator } from "@shared/generators/user.generator";

describe("UsernameComponent", () => {
  let component: UsernameComponent;

  beforeEach(() => MockBuilder(UsernameComponent, AppModule));
  beforeEach(() => (component = MockRender(UsernameComponent).point.componentInstance));
  beforeEach(() => (component.user = UserGenerator.user()));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
