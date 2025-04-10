import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchGroupsFilterComponent } from "./search-groups-filter.component";

describe("SearchGroupsFilterComponent", () => {
  let component: SearchGroupsFilterComponent;
  let fixture: ComponentFixture<SearchGroupsFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchGroupsFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchGroupsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
