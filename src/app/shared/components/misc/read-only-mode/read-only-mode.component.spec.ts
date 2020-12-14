import { ReadOnlyModeComponent } from "./read-only-mode.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("ReadOnlyModeComponent", () => {
  let component: ReadOnlyModeComponent;

  beforeEach(async () => MockBuilder(ReadOnlyModeComponent, AppModule));
  beforeEach(() => (component = MockRender(ReadOnlyModeComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
