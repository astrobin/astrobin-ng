import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MostOftenUsedWithModalComponent } from "./most-often-used-with-modal.component";

describe("MostOftenUsedWithModalComponent", () => {
  let component: MostOftenUsedWithModalComponent;
  let fixture: ComponentFixture<MostOftenUsedWithModalComponent>;

  beforeEach(async () => {
    await MockBuilder(MostOftenUsedWithModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
