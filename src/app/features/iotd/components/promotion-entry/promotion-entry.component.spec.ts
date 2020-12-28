import { ComponentFixture, TestBed } from "@angular/core/testing";

import { initialState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { PromotionEntryComponent } from "./promotion-entry.component";

describe("PromotionEntryComponent", () => {
  let component: PromotionEntryComponent;
  let fixture: ComponentFixture<PromotionEntryComponent>;

  beforeEach(async () => {
    await MockBuilder(PromotionEntryComponent, IotdModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
