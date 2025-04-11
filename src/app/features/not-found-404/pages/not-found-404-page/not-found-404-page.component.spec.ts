import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

import { NotFound404PageComponent } from "./not-found-404-page.component";

describe("NotFoundPageComponent", () => {
  let component: NotFound404PageComponent;

  beforeEach(() =>
    MockBuilder(NotFound404PageComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }))
  );
  beforeEach(() => (component = MockRender(NotFound404PageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
