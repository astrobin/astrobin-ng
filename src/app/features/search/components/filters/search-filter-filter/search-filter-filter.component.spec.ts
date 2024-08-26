import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchFilterFilterComponent } from "./search-filter-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SearchTelescopeFilterComponent", () => {
  let component: SearchFilterFilterComponent;
  let fixture: ComponentFixture<SearchFilterFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchFilterFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchFilterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
