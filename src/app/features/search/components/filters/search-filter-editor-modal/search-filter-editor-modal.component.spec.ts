import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchFilterEditorModalComponent } from "./search-filter-editor-modal.component";

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
