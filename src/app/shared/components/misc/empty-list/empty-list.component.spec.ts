import { EmptyListComponent } from "./empty-list.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("EmptyListComponent", () => {
  let component: EmptyListComponent;

  beforeEach(async () => MockBuilder(EmptyListComponent, AppModule));
  beforeEach(() => (component = MockRender(EmptyListComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
