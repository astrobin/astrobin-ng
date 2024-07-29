import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchSubjectTypeFilterComponent } from "./search-subject-type-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SubjectTypeFilterComponent", () => {
  let component: SearchSubjectTypeFilterComponent;
  let fixture: ComponentFixture<SearchSubjectTypeFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchSubjectTypeFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchSubjectTypeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
