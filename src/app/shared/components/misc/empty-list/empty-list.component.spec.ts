import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

import { EmptyListComponent } from "./empty-list.component";

describe("EmptyListComponent", () => {
  let component: EmptyListComponent;

  beforeEach(
    async () =>
      await MockBuilder(EmptyListComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }))
  );
  beforeEach(() => (component = MockRender(EmptyListComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
