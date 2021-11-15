import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FilterEditorComponent } from "./filter-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { AppModule } from "@app/app.module";

describe("FilterEditorComponent", () => {
  let component: FilterEditorComponent;
  let fixture: ComponentFixture<FilterEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(FilterEditorComponent, EquipmentModule)
      .mock(AppModule)
      .provide([provideMockStore({ initialState }), provideMockActions(() => new ReplaySubject<any>())]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
