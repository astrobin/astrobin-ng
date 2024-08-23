import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchSubjectsFilterComponent } from "./search-subjects-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SubjectsFilterComponent", () => {
  let component: SearchSubjectsFilterComponent;
  let fixture: ComponentFixture<SearchSubjectsFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchSubjectsFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchSubjectsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
