import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchPersonalFiltersFilterComponent } from "./search-personal-filters-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("PersonalFiltersFilterComponent", () => {
  let component: SearchPersonalFiltersFilterComponent;
  let fixture: ComponentFixture<SearchPersonalFiltersFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchPersonalFiltersFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchPersonalFiltersFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
