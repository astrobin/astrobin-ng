import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IotdModule } from "@features/iotd/iotd.module";
import { MockBuilder } from "ng-mocks";
import { PromotionSlotsComponent } from "./promotion-slots.component";

describe("PromotionSlotsComponent", () => {
  let component: PromotionSlotsComponent;
  let fixture: ComponentFixture<PromotionSlotsComponent>;

  beforeEach(async () => await MockBuilder(PromotionSlotsComponent, IotdModule));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionSlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
