import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UsersUsingItemComponent } from "./users-using-item.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("UsersUsingItemComponent", () => {
  let component: UsersUsingItemComponent;
  let fixture: ComponentFixture<UsersUsingItemComponent>;

  beforeEach(async () => {
    await MockBuilder(UsersUsingItemComponent, AppModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersUsingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
