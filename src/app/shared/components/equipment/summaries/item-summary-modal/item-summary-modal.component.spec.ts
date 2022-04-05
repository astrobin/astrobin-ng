import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ItemSummaryModalComponent } from "./item-summary-modal.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AppModule } from "@app/app.module";
import { ItemSummaryComponent } from "@shared/components/equipment/summaries/item-summary/item-summary.component";

describe("ItemSummaryModalComponent", () => {
  let component: ItemSummaryModalComponent;
  let fixture: ComponentFixture<ItemSummaryModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemSummaryModalComponent, AppModule)
      .provide([provideMockStore({ initialState }), NgbActiveModal])
      .mock(ItemSummaryComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSummaryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
