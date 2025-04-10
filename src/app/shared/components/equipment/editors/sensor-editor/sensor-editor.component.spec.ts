import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { BrandEditorCardComponent } from "@shared/components/equipment/editors/brand-editor-card/brand-editor-card.component";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { SensorEditorComponent } from "./sensor-editor.component";

describe("SensorEditorComponent", () => {
  let component: SensorEditorComponent;
  let fixture: ComponentFixture<SensorEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(SensorEditorComponent, EquipmentModule)
      .mock(AppModule, { export: true })
      .provide([
        provideMockStore({ initialState: initialMainState }),
        provideMockActions(() => new ReplaySubject<any>()),
        UtilsService
      ])
      .mock(BrandEditorCardComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
