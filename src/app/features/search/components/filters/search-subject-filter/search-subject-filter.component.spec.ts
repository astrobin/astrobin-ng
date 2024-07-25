import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchSubjectFilterComponent } from "./search-subject-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SubjectFilterComponent", () => {
  let component: SearchSubjectFilterComponent;
  let fixture: ComponentFixture<SearchSubjectFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchSubjectFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchSubjectFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
