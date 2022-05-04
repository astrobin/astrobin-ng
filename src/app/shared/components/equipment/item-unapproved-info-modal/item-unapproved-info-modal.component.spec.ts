import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ItemUnapprovedInfoModalComponent } from "./item-unapproved-info-modal.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AppModule } from "@app/app.module";

describe("ItemUnapprovedInfoModalComponent", () => {
  let component: ItemUnapprovedInfoModalComponent;
  let fixture: ComponentFixture<ItemUnapprovedInfoModalComponent>;

  beforeEach(async () => {
    await MockBuilder(ItemUnapprovedInfoModalComponent, AppModule).provide([
      provideMockStore({ initialState }),
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
