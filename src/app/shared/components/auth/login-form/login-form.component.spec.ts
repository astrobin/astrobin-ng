import { AppModule } from "@app/app.module";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";
import { LoginFormComponent } from "./login-form.component";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("LoginFormComponent", () => {
  let component: LoginFormComponent;

  beforeEach(() =>
    MockBuilder(LoginFormComponent, AppModule)
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide(provideMockStore({ initialState }))
  );

  beforeEach(() => {
    component = MockRender(LoginFormComponent).point.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
