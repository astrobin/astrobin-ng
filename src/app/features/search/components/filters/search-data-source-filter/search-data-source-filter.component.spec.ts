import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchDataSourceFilterComponent } from "./search-data-source-filter.component";

describe("DataSourceFilterComponent", () => {
  let component: SearchDataSourceFilterComponent;
  let fixture: ComponentFixture<SearchDataSourceFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchDataSourceFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchDataSourceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
