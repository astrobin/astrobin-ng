import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";

import { RejectItemModalComponent } from "./reject-item-modal.component";
import { MockBuilder } from "ng-mocks";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

describe("RejectItemModalComponent", () => {
  let component: RejectItemModalComponent;
  let fixture: ComponentFixture<RejectItemModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectItemModalComponent, AppModule).provide(NgbActiveModal);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
