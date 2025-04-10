import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ItemUnapprovedInfoModalComponent } from "./item-unapproved-info-modal.component";

describe("ItemUnapprovedInfoModalComponent", () => {
  let component: ItemUnapprovedInfoModalComponent;
  let fixture: ComponentFixture<ItemUnapprovedInfoModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemUnapprovedInfoModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      NgbActiveModal
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemUnapprovedInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
