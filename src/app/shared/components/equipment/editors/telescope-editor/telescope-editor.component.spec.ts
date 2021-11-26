import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TelescopeEditorComponent } from "./telescope-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { AppModule } from "@app/app.module";
import { BrandEditorCardComponent } from "@shared/components/equipment/editors/brand-editor-card/brand-editor-card.component";

describe("TelescopeEditorComponent", () => {
  let component: TelescopeEditorComponent;
  let fixture: ComponentFixture<TelescopeEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(TelescopeEditorComponent, EquipmentModule)
      .mock(AppModule)
      .provide([provideMockStore({ initialState }), provideMockActions(() => new ReplaySubject<any>())])
      .mock(BrandEditorCardComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelescopeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
