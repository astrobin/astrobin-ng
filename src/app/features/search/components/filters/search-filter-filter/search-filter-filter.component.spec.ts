import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchFilterFilterComponent } from "./search-filter-filter.component";

describe("SearchFilterFilterComponent", () => {
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
