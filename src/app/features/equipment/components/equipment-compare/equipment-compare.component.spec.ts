import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EquipmentCompareComponent } from "./equipment-compare.component";

describe("CompareComponent", () => {
  let component: EquipmentCompareComponent;
  let fixture: ComponentFixture<EquipmentCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EquipmentCompareComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
