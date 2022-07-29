import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MostOftenUsedWithModalComponent } from "./most-often-used-with-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";

describe("MostOftenUsedWithModalComponent", () => {
  let component: MostOftenUsedWithModalComponent;
  let fixture: ComponentFixture<MostOftenUsedWithModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MostOftenUsedWithModalComponent, AppModule).provide([
      provideMockStore({ initialState }),
      NgbActiveModal
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MostOftenUsedWithModalComponent);
    component = fixture.componentInstance;
    component.item = TelescopeGenerator.telescope();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
