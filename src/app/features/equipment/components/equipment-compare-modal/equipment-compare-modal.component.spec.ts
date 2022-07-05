import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EquipmentCompareModalComponent } from "./equipment-compare-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CompareService } from "@features/equipment/services/compare.service";

describe("EquipmentCompareModalComponent", () => {
  let component: EquipmentCompareModalComponent;
  let fixture: ComponentFixture<EquipmentCompareModalComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentCompareModalComponent, AppModule).provide([
      provideMockStore({ initialState }),
      NgbActiveModal,
      CompareService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentCompareModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
