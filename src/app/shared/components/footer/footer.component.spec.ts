import { MockBuilder, MockRender } from "ng-mocks";
import { FooterComponent } from "./footer.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("FooterComponent", () => {
  let component: FooterComponent;

  beforeEach(() => MockBuilder(FooterComponent).provide(provideMockStore({ initialState })));
  beforeEach(() => (component = MockRender(FooterComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
