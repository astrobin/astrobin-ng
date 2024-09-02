import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoadingDialogComponent } from "./loading-dialog.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("LoadingDialogComponent", () => {
  let component: LoadingDialogComponent;
  let fixture: ComponentFixture<LoadingDialogComponent>;

  beforeEach(async () => {
    await MockBuilder(LoadingDialogComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState: initialMainState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
