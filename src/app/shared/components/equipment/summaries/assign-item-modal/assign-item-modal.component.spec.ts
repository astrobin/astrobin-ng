import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignItemModalComponent } from "./assign-item-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("AssignItemModalComponent", () => {
  let component: AssignItemModalComponent;
  let fixture: ComponentFixture<AssignItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(AssignItemModalComponent, AppModule).provide([provideMockStore({ initialState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
