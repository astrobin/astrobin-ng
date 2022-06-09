import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ImagesUsingItemComponent } from "./images-using-item.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ImagesUsingItemComponent", () => {
  let component: ImagesUsingItemComponent;
  let fixture: ComponentFixture<ImagesUsingItemComponent>;

  beforeEach(async () => {
    await MockBuilder(ImagesUsingItemComponent, AppModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagesUsingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
