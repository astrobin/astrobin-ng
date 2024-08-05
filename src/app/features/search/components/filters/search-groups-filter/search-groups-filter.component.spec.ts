import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchGroupsFilterComponent } from "./search-groups-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
