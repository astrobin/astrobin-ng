import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SubscriptionRequiredModalComponent } from "./subscription-required-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

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
