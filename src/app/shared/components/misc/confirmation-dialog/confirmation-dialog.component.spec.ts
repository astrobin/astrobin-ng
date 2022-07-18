import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmationDialogComponent } from "./confirmation-dialog.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ConfirmationDialogComponent", () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await MockBuilder(ConfirmationDialogComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
