import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchFilterTypesFilterComponent } from "./search-filter-types-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("FilterTypesFilterComponent", () => {
  let component: SearchFilterTypesFilterComponent;
  let fixture: ComponentFixture<SearchFilterTypesFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchFilterTypesFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchFilterTypesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
