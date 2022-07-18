import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { NotFound404PageComponent } from "./not-found-404-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("NotFoundPageComponent", () => {
  let component: NotFound404PageComponent;

  beforeEach(() => MockBuilder(NotFound404PageComponent, AppModule).provide(provideMockStore({ initialState })));
  beforeEach(() => (component = MockRender(NotFound404PageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
