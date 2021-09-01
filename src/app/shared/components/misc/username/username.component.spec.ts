import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { UsernameComponent } from "./username.component";
import { UserGenerator } from "@shared/generators/user.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { TestBed } from "@angular/core/testing";

describe("UsernameComponent", () => {
  let component: UsernameComponent;

  beforeEach(() => MockBuilder(UsernameComponent, AppModule).provide(provideMockStore({ initialState })));
  beforeEach(() => (component = TestBed.createComponent(UsernameComponent).componentInstance));
  beforeEach(() => (component.user = UserGenerator.user()));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
