import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentPresetSummaryComponent } from './equipment-preset-summary.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe('PresetSummaryComponent', () => {
  let component: EquipmentPresetSummaryComponent;
  let fixture: ComponentFixture<EquipmentPresetSummaryComponent>;

  beforeEach(async() => {
    await MockBuilder(EquipmentPresetSummaryComponent, AppModule);
    fixture = TestBed.createComponent(EquipmentPresetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
