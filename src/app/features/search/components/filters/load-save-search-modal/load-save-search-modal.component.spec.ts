import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { LoadSaveSearchModalComponent } from "./load-save-search-modal.component";

describe("LoadSaveSearchModalComponent", () => {
  let component: LoadSaveSearchModalComponent;
  let fixture: ComponentFixture<LoadSaveSearchModalComponent>;

  beforeEach(async () => {
    await MockBuilder(LoadSaveSearchModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      NgbActiveModal
    ]);

    fixture = TestBed.createComponent(LoadSaveSearchModalComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.savedSearchApiService, "load").mockReturnValue(of([]));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
