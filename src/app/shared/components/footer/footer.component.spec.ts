import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

import { FooterComponent } from "./footer.component";

describe("FooterComponent", () => {
  let component: FooterComponent;

  beforeEach(() => MockBuilder(FooterComponent).provide(provideMockStore({ initialState: initialMainState })));
  beforeEach(() => (component = MockRender(FooterComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
