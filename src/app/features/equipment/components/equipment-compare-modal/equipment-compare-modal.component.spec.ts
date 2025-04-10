import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { CompareService } from "@features/equipment/services/compare.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { EquipmentCompareModalComponent } from "./equipment-compare-modal.component";

describe("EquipmentCompareModalComponent", () => {
  let component: EquipmentCompareModalComponent;
  let fixture: ComponentFixture<EquipmentCompareModalComponent>;

  beforeEach(async () => {
    await MockBuilder(EquipmentCompareModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
