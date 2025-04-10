import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MoreRelatedItemsModalComponent } from "./more-related-items-modal.component";

describe("MoreRelatedItemsModalComponent", () => {
  let component: MoreRelatedItemsModalComponent;
  let fixture: ComponentFixture<MoreRelatedItemsModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MoreRelatedItemsModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
