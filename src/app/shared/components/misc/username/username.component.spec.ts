import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder } from "ng-mocks";

import { UsernameComponent } from "./username.component";

describe("UsernameComponent", () => {
  let component: UsernameComponent;

  beforeEach(() =>
    MockBuilder(UsernameComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }))
  );
  beforeEach(() => (component = TestBed.createComponent(UsernameComponent).componentInstance));
  beforeEach(() => (component.user = UserGenerator.user()));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
