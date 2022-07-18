import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { EmptyListComponent } from "./empty-list.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("EmptyListComponent", () => {
  let component: EmptyListComponent;

  beforeEach(async () => MockBuilder(EmptyListComponent, AppModule).provide(provideMockStore({ initialState })));
  beforeEach(() => (component = MockRender(EmptyListComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
