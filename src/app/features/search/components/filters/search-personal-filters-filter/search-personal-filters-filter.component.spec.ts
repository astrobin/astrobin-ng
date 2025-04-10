import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchPersonalFiltersFilterComponent } from "./search-personal-filters-filter.component";

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
