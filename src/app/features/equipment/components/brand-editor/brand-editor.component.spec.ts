import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BrandEditorComponent } from "./brand-editor.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";

describe("BrandEditorComponent", () => {
  let component: BrandEditorComponent;
  let fixture: ComponentFixture<BrandEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandEditorComponent, EquipmentModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
