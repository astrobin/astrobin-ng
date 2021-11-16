import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SoftwareEditorComponent } from "./software-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { AppModule } from "@app/app.module";

describe("SoftwareEditorComponent", () => {
  let component: SoftwareEditorComponent;
  let fixture: ComponentFixture<SoftwareEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(SoftwareEditorComponent, EquipmentModule)
      .mock(AppModule)
      .provide([provideMockStore({ initialState }), provideMockActions(() => new ReplaySubject<any>())]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoftwareEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
