import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchFilterEditorModalComponent } from "./search-filter-editor-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

describe("SearchFilterEditorModalComponent", () => {
  let component: SearchFilterEditorModalComponent;
  let fixture: ComponentFixture<SearchFilterEditorModalComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchFilterEditorModalComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      NgbActiveModal
    ]);

    fixture = TestBed.createComponent(SearchFilterEditorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
