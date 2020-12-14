import { NotFound404PageComponent } from "./not-found-404-page.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("NotFoundPageComponent", () => {
  let component: NotFound404PageComponent;

  beforeEach(() => MockBuilder(NotFound404PageComponent, AppModule));
  beforeEach(() => (component = MockRender(NotFound404PageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
