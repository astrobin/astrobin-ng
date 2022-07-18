import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { PermissionDeniedPageComponent } from "./permission-denied-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("PermissionDeniedPageComponent", () => {
  let component: PermissionDeniedPageComponent;

  beforeEach(() => MockBuilder(PermissionDeniedPageComponent, AppModule).provide(provideMockStore({ initialState })));
  beforeEach(() => (component = MockRender(PermissionDeniedPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
