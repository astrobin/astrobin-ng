import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RemoveAdsDialogComponent } from "./remove-ads-dialog.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ConfirmationDialogComponent", () => {
  let component: RemoveAdsDialogComponent;
  let fixture: ComponentFixture<RemoveAdsDialogComponent>;

  beforeEach(async () => {
    await MockBuilder(RemoveAdsDialogComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState })
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
