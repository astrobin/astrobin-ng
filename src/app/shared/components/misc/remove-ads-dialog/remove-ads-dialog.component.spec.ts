import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { RemoveAdsDialogComponent } from "./remove-ads-dialog.component";

describe("ConfirmationDialogComponent", () => {
  let component: RemoveAdsDialogComponent;
  let fixture: ComponentFixture<RemoveAdsDialogComponent>;

  beforeEach(async () => {
    await MockBuilder(RemoveAdsDialogComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState: initialMainState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveAdsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
