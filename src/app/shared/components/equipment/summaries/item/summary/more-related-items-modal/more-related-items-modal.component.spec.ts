import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MoreRelatedItemsModalComponent } from "./more-related-items-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";

describe("MoreRelatedItemsModalComponent", () => {
  let component: MoreRelatedItemsModalComponent;
  let fixture: ComponentFixture<MoreRelatedItemsModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MoreRelatedItemsModalComponent, AppModule).provide([
      provideMockStore({ initialState }),
      NgbActiveModal
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreRelatedItemsModalComponent);
    component = fixture.componentInstance;
    component.items = [TelescopeGenerator.telescope()];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
