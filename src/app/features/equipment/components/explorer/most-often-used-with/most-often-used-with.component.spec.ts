import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MostOftenUsedWithComponent } from "./most-often-used-with.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MostOftenUsedWithComponent", () => {
  let component: MostOftenUsedWithComponent;
  let fixture: ComponentFixture<MostOftenUsedWithComponent>;

  beforeEach(async () => {
    await MockBuilder(MostOftenUsedWithComponent, AppModule).provide([provideMockStore({ initialState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MostOftenUsedWithComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
