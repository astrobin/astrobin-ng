import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HrComponent } from "./hr.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("HrComponent", () => {
  let component: HrComponent;
  let fixture: ComponentFixture<HrComponent>;

  beforeEach(async () => {
    await MockBuilder(HrComponent, AppModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
