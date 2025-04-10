import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SubscriptionRequiredModalComponent } from "./subscription-required-modal.component";

describe("SubscriptionRequiredModalComponent", () => {
  let component: SubscriptionRequiredModalComponent;
  let fixture: ComponentFixture<SubscriptionRequiredModalComponent>;

  beforeEach(async () => {
    await MockBuilder(SubscriptionRequiredModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      NgbActiveModal
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionRequiredModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
